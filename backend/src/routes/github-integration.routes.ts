import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  connectGitHubController,
  autoConnectGitHubController,
  disconnectGitHubController,
  listIntegrationsController,
  getIntegrationController,
  getGitHubProfileController,
  listRepositoriesController,
  importRepositoryController,
  bulkImportRepositoriesController,
  importFromUrlController,
  listOrganizationsController,
  listOrgRepositoriesController,
  syncRepositoryController,
  analyzeRepositoryController,
  listBranchesController,
  listCommitsController,
  getCommitDetailController,
  compareCommitsController,
  listTagsController,
  listReleasesController,
  listContributorsController,
  getReadmeController,
  getLicenseController,
  getRepositoryLanguagesController,
  listPullRequestsController,
  getPullRequestController,
  listPRCommitsController,
  getMergeStatusController,
  listIssuesController,
  getIssueController,
  listLabelsController,
  listMilestonesController,
  createIssueController,
  createPullRequestController,
  createIssueCommentController,
  createPRCommentController,
  createPRReviewController,
  mergePullRequestController,
  listWorkflowsController,
  listWorkflowRunsController,
  getWorkflowRunDetailController,
  listCheckRunsController,
  listDeploymentsController,
  getBranchProtectionController,
  updateBranchProtectionController,
} from "../controllers/github-integration.controller.js";

const router = Router();

// ── Integration Management ──
router.post("/github-integrations/connect", requireAuth, connectGitHubController);
router.post("/github-integrations/auto-connect", requireAuth, autoConnectGitHubController);
router.get("/github-integrations", requireAuth, listIntegrationsController);
router.get("/github-integrations/:integrationId", requireAuth, getIntegrationController);
router.get("/github-integrations/:integrationId/profile", requireAuth, getGitHubProfileController);
router.delete("/github-integrations/:integrationId", requireAuth, disconnectGitHubController);

// ── Repository Management ──
router.get("/github-integrations/:integrationId/repos", requireAuth, listRepositoriesController);
router.post("/github-integrations/:integrationId/repos/import", requireAuth, importRepositoryController);
router.post("/github-integrations/:integrationId/repos/bulk-import", requireAuth, bulkImportRepositoriesController);
router.post("/github-integrations/:integrationId/repos/import-url", requireAuth, importFromUrlController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/sync", requireAuth, syncRepositoryController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/analyze", requireAuth, analyzeRepositoryController);

// ── Organizations ──
router.get("/github-integrations/:integrationId/orgs", requireAuth, listOrganizationsController);
router.get("/github-integrations/:integrationId/orgs/:org/repos", requireAuth, listOrgRepositoriesController);

// ── Branches ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/branches", requireAuth, listBranchesController);

// ── Commits ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/commits", requireAuth, listCommitsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/commits/:sha", requireAuth, getCommitDetailController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/compare/:base...:head", requireAuth, compareCommitsController);

// ── Tags & Releases ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/tags", requireAuth, listTagsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/releases", requireAuth, listReleasesController);

// ── Contributors ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/contributors", requireAuth, listContributorsController);

// ── Repository Info ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/readme", requireAuth, getReadmeController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/license", requireAuth, getLicenseController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/languages", requireAuth, getRepositoryLanguagesController);

// ── Pull Requests ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls", requireAuth, listPullRequestsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber", requireAuth, getPullRequestController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber/commits", requireAuth, listPRCommitsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber/merge-status", requireAuth, getMergeStatusController);

// ── Issues ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/issues", requireAuth, listIssuesController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/issues/:issueNumber", requireAuth, getIssueController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/labels", requireAuth, listLabelsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/milestones", requireAuth, listMilestonesController);

// ═══════════════════════════════════════════════════════════════════════════
// WRITE-BACK OPERATIONS (Create PRs, Issues, Comments, Reviews, Merge)
// ═══════════════════════════════════════════════════════════════════════════

router.post("/github-integrations/:integrationId/repos/:owner/:repo/issues", requireAuth, createIssueController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/pulls", requireAuth, createPullRequestController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/issues/:issueNumber/comments", requireAuth, createIssueCommentController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber/comments", requireAuth, createPRCommentController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber/reviews", requireAuth, createPRReviewController);
router.post("/github-integrations/:integrationId/repos/:owner/:repo/pulls/:pullNumber/merge", requireAuth, mergePullRequestController);

// ═══════════════════════════════════════════════════════════════════════════
// CI/CD INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

router.get("/github-integrations/:integrationId/repos/:owner/:repo/actions/workflows", requireAuth, listWorkflowsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/actions/runs", requireAuth, listWorkflowRunsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/actions/runs/:runId", requireAuth, getWorkflowRunDetailController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/check-runs/:ref", requireAuth, listCheckRunsController);
router.get("/github-integrations/:integrationId/repos/:owner/:repo/deployments", requireAuth, listDeploymentsController);

// ── Branch Protection ──
router.get("/github-integrations/:integrationId/repos/:owner/:repo/branches/:branch/protection", requireAuth, getBranchProtectionController);
router.put("/github-integrations/:integrationId/repos/:owner/:repo/branches/:branch/protection", requireAuth, updateBranchProtectionController);

export default router;
