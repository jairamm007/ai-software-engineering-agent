import { Router } from "express";
import {
  receiveWebhookController,
  listWebhookEventsController,
  getWebhookEventController,
} from "../controllers/webhook.controller.js";

const router = Router();

// GitHub sends webhooks to this endpoint (no auth — verified by HMAC signature)
router.post("/webhooks/github", receiveWebhookController);

// List and get webhook events (used by frontend)
router.get("/webhooks/events", listWebhookEventsController);
router.get("/webhooks/events/:id", getWebhookEventController);

export default router;
