import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  connectGitHubController,
  autoConnectGitHubController,
  disconnectGitHubController,
  listIntegrationsController,
  getIntegrationController,
  listRepositoriesController,
  importRepositoryController,
  listBranchesController,
  listCommitsController,
  listPullRequestsController,
  getPullRequestController,
  listIssuesController,
  getIssueController,
  syncRepositoryController,
  analyzeRepositoryController,
} from "../controllers/github-integration.controller.js";

const router = Router();

router.post("/github-integrations/connect", requireAuth, connectGitHubController);
router.post("/github-integrations/auto-connect", requireAuth, autoConnectGitHubController);
router.get("/github-integrations", requireAuth, listIntegrationsController);
router.get("/github-integrations/:integrationId", requireAuth, getIntegrationController);
router.delete("/github-integrations/:integrationId", requireAuth, disconnectGitHubController);

router.get("/github-integrations/:integrationId/repos", requireAuth, listRepositoriesController);
router.post("/github-integrations/:integrationId/repos/import", requireAuth, importRepositoryController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/sync", requireAuth, syncRepositoryController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/analyze", requireAuth, analyzeRepositoryController);

router.get("/github-integrations/:integrationId/repos/:owner/:repo/branches", requireAuth, listBranchesController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/commits", requireAuth, listCommitsController);

router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls", requireAuth, listPullRequestsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber", requireAuth, getPullRequestController);

router.get("/github-integrations/:integrationId/repos/:owner/:repo/issues", requireAuth, listIssuesController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/issues/:issueNumber", requireAuth, getIssueController);

export default router;
