import { Router } from "express";
import { analyzeRepositoryController } from "../controllers/repository.controller.js";

const router = Router();

router.post("/analyze", analyzeRepositoryController);

export default router;