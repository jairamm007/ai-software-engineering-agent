import { Router } from "express";

import { agentController } from "../controllers/agent.controller.js";

const router = Router();

router.post("/", agentController);

export default router;