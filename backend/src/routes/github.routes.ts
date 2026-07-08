import { Router } from "express";

import {
  parseRepositoryController,
  cloneRepositoryController,
} from "../controllers/github.controller.js";

const router = Router();

router.post("/parse", parseRepositoryController);

router.post("/clone", cloneRepositoryController);

export default router;