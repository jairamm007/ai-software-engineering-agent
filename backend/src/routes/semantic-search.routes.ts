import {Router} from "express";
import {requireAuth} from "../auth/auth.middleware.js";

import {
  combinedSearchController,
  semanticSearchController,
  fileSearchController,
  functionSearchController,
  classSearchController,
} from "../controllers/semantic-search.controller.js";

const router = Router();

router.get("/:id/search", requireAuth, combinedSearchController);
router.get("/:id/search/semantic", requireAuth, semanticSearchController);
router.get("/:id/search/files", requireAuth, fileSearchController);
router.get("/:id/search/functions", requireAuth, functionSearchController);
router.get("/:id/search/classes", requireAuth, classSearchController);

export default router;
