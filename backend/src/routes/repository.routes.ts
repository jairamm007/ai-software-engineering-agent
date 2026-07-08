import { Router } from "express";

import {
  analyzeRepositoryController,
  getRepositoriesController,
  getRepositoryByIdController,
  deleteRepositoryController,
} from "../controllers/repository.controller.js";

const router = Router();

/**
 * Repository Management
 */
router.get("/", getRepositoriesController);

router.get("/:id", getRepositoryByIdController);

router.delete("/:id", deleteRepositoryController);

/**
 * Repository Indexing
 */
router.post("/analyze", analyzeRepositoryController);

export default router;