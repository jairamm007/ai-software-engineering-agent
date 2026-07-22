import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";

import {
  generateReadmeController,
  generateApiDocsController,
  generateFunctionDocsController,
  generateClassDocsController,
  generateArchitectureDocsController,
  generateAllDocsController,
} from "../controllers/documentation-generator.controller.js";

const router = Router();

router.get("/:id/documentation/all", requireAuth, generateAllDocsController);
router.get("/:id/documentation/readme", requireAuth, generateReadmeController);
router.get("/:id/documentation/api-docs", requireAuth, generateApiDocsController);
router.get("/:id/documentation/functions", requireAuth, generateFunctionDocsController);
router.get("/:id/documentation/classes", requireAuth, generateClassDocsController);
router.get("/:id/documentation/architecture", requireAuth, generateArchitectureDocsController);

export default router;
