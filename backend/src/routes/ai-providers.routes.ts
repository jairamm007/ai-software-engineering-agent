import { Router } from "express";
import { aiProvidersController } from "../controllers/ai-providers.controller.js";

const router = Router();

router.get("/", aiProvidersController);

export default router;
