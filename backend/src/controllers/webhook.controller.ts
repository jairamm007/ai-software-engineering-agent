import type { Request, Response } from "express";
import { verifyWebhookSignature, processWebhookEvent, listWebhookEvents, getWebhookEvent } from "../services/webhook.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import { prisma } from "../database/prisma.js";

const s = (v: string | string[] | undefined): string | undefined =>
  v === undefined ? undefined : Array.isArray(v) ? v[0] : v;

export const receiveWebhookController = async (req: Request, res: Response) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const deliveryId = req.headers["x-github-delivery"] as string | undefined;
  const eventType = req.headers["x-github-event"] as string | undefined;

  if (!eventType) {
    res.status(400).json(errorResponse("Missing x-github-event header"));
    return;
  }

  // Verify signature
  if (!verifyWebhookSignature(JSON.stringify(req.body), signature)) {
    res.status(401).json(errorResponse("Invalid webhook signature"));
    return;
  }

  // Find the integration for this repository
  const repo = req.body?.repository as { full_name?: string } | undefined;
  const repoFullName = repo?.full_name;

  if (!repoFullName) {
    res.status(200).json({ ok: true, message: "No repository in payload" });
    return;
  }

  const [owner, name] = repoFullName.split("/");
  if (!owner || !name) {
    res.status(200).json({ ok: true, message: "Invalid repository name" });
    return;
  }

  // Find integration by repo owner/name
  const integrationRepo = await prisma.gitHubIntegrationRepository.findFirst({
    where: { owner, name },
    include: { integration: true },
  });

  if (!integrationRepo) {
    console.log(`No integration found for ${repoFullName}, ignoring webhook`);
    res.status(200).json({ ok: true, message: "Repository not tracked" });
    return;
  }

  // Process the event
  await processWebhookEvent(integrationRepo.integrationId, eventType, deliveryId, req.body);

  res.status(200).json({ ok: true });
};

export const listWebhookEventsController = async (req: Request, res: Response) => {
  const integrationId = s(req.query.integrationId as string | string[]);
  if (!integrationId) {
    res.status(400).json(errorResponse("integrationId is required"));
    return;
  }

  try {
    const result = await listWebhookEvents(integrationId, {
      eventType: s(req.query.eventType as string | string[] | undefined),
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 20,
    });
    res.status(200).json(successResponse(result, "Webhook events fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch webhook events"));
  }
};

export const getWebhookEventController = async (req: Request, res: Response) => {
  const id = s(req.params.id as string | string[] | undefined);
  if (!id) {
    res.status(400).json(errorResponse("Event ID is required"));
    return;
  }

  try {
    const event = await getWebhookEvent(id);
    if (!event) {
      res.status(404).json(errorResponse("Event not found"));
      return;
    }
    res.status(200).json(successResponse(event, "Webhook event fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch webhook event"));
  }
};
