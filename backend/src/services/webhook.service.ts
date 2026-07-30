import crypto from "crypto";
import {
  createWebhookEvent,
  markWebhookEventProcessed,
  getWebhookEvents,
  getWebhookEventById,
  getWebhookEventsByDeliveryId,
} from "../repository/webhook.repository.js";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string | undefined
): boolean => {
  if (!WEBHOOK_SECRET) {
    console.warn("GITHUB_WEBHOOK_SECRET not set — skipping signature verification");
    return true;
  }

  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(typeof payload === "string" ? payload : payload.toString())
    .digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export const processWebhookEvent = async (
  integrationId: string,
  eventType: string,
  deliveryId: string | undefined,
  payload: Record<string, unknown>
) => {
  const action = payload.action as string | undefined;
  const repo = payload.repository as { full_name?: string } | undefined;
  const [owner, name] = repo?.full_name?.split("/") ?? [];

  const event = await createWebhookEvent({
    integrationId,
    eventType,
    action,
    deliveryId,
    repositoryOwner: owner,
    repositoryName: name,
    payload,
  });

  try {
    await handleWebhookEvent(eventType, action, payload);
    await markWebhookEventProcessed(event.id);
  } catch (error) {
    console.error(`Failed to process webhook event ${eventType}:`, error);
  }

  return event;
};

const handleWebhookEvent = async (
  eventType: string,
  action: string | undefined,
  payload: Record<string, unknown>
) => {
  switch (eventType) {
    case "push":
      await handlePushEvent(payload);
      break;
    case "pull_request":
      await handlePullRequestEvent(action, payload);
      break;
    case "issues":
      await handleIssuesEvent(action, payload);
      break;
    case "issue_comment":
      await handleIssueCommentEvent(action, payload);
      break;
    case "pull_request_review":
      await handlePullRequestReviewEvent(action, payload);
      break;
    case "check_run":
      await handleCheckRunEvent(action, payload);
      break;
    case "workflow_run":
      await handleWorkflowRunEvent(action, payload);
      break;
    case "ping":
      console.log("Webhook ping received");
      break;
    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }
};

const handlePushEvent = async (payload: Record<string, unknown>) => {
  const ref = payload.ref as string;
  const commits = payload.commits as Array<{ id: string; message: string }> | undefined;
  console.log(`Push to ${ref}: ${commits?.length ?? 0} commits`);
};

const handlePullRequestEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const pr = payload.pull_request as { number?: number; title?: string; state?: string } | undefined;
  console.log(`PR #${pr?.number} ${action}: ${pr?.title}`);
};

const handleIssuesEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const issue = payload.issue as { number?: number; title?: string } | undefined;
  console.log(`Issue #${issue?.number} ${action}: ${issue?.title}`);
};

const handleIssueCommentEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const comment = payload.comment as { body?: string } | undefined;
  const issue = payload.issue as { number?: number } | undefined;
  console.log(`Comment on #${issue?.number} ${action}: ${comment?.body?.slice(0, 50)}`);
};

const handlePullRequestReviewEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const review = payload.review as { state?: string; body?: string } | undefined;
  const pr = payload.pull_request as { number?: number } | undefined;
  console.log(`Review on PR #${pr?.number} ${action}: ${review?.state}`);
};

const handleCheckRunEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const checkRun = payload.check_run as { name?: string; status?: string; conclusion?: string } | undefined;
  console.log(`Check run ${checkRun?.name} ${action}: ${checkRun?.conclusion ?? checkRun?.status}`);
};

const handleWorkflowRunEvent = async (action: string | undefined, payload: Record<string, unknown>) => {
  const run = payload.workflow_run as { name?: string; conclusion?: string; status?: string } | undefined;
  console.log(`Workflow run ${run?.name} ${action}: ${run?.conclusion ?? run?.status}`);
};

// ── Query functions ──

export const listWebhookEvents = async (
  integrationId: string,
  options?: { eventType?: string; page?: number; perPage?: number }
) => {
  return getWebhookEvents(integrationId, options);
};

export const getWebhookEvent = async (id: string) => {
  return getWebhookEventById(id);
};

export const getWebhookEventsByDelivery = async (deliveryId: string) => {
  return getWebhookEventsByDeliveryId(deliveryId);
};
