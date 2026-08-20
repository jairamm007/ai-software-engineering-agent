-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "bannerUrl" TEXT,
    "bio" TEXT,
    "role" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "userCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryFile" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "RepositoryFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeChunk" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startLine" INTEGER NOT NULL,
    "endLine" INTEGER NOT NULL,

    CONSTRAINT "CodeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSymbol" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "exported" BOOLEAN NOT NULL,

    CONSTRAINT "CodeSymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "accentColor" TEXT NOT NULL DEFAULT 'violet',

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "logo" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRepository" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'read',
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamActivity" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "mentions" TEXT[],
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedDocument" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamChat" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamNotification" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "linkTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubIntegrationRepository" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "starsCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubIntegrationRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubWebhookEvent" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "action" TEXT,
    "deliveryId" TEXT,
    "repositoryOwner" TEXT,
    "repositoryName" TEXT,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReview" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "summary" TEXT,
    "issuesFound" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "reportData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestReport" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "failedTests" INTEGER NOT NULL DEFAULT 0,
    "skippedTests" INTEGER NOT NULL DEFAULT 0,
    "coverage" DOUBLE PRECISION,
    "reportData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebugRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "repoName" TEXT,
    "repoUrl" TEXT,
    "branch" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "stage" TEXT NOT NULL DEFAULT 'debug',
    "stackDetected" TEXT,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "currentAttempt" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebugRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebugFailure" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "testName" TEXT,
    "testFile" TEXT,
    "errorType" TEXT,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "implicatedFiles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugFailure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "failureId" TEXT,
    "reasoning" TEXT NOT NULL,
    "rootCauseFile" TEXT,
    "rootCauseLine" INTEGER,
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patch" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "diffText" TEXT NOT NULL,
    "summary" TEXT,
    "filesTouched" JSONB,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "testResult" TEXT,
    "testOutput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityScanResult" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "tool" TEXT NOT NULL DEFAULT 'bandit',
    "summary" TEXT,
    "findings" JSONB,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'running',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfBaseline" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'pre',
    "timeMs" INTEGER,
    "memoryMb" INTEGER,
    "queryCount" INTEGER,
    "command" TEXT,
    "heuristic" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerfBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfComparison" (
    "id" TEXT NOT NULL,
    "debugRunId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "beforeValue" DOUBLE PRECISION,
    "afterValue" DOUBLE PRECISION,
    "pctChange" DOUBLE PRECISION,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerfComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'feedback',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupRecord" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "type" TEXT NOT NULL DEFAULT 'full',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInsights" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "overview" TEXT NOT NULL,
    "architecture" JSONB NOT NULL,
    "modules" JSONB NOT NULL,
    "dependencies" JSONB NOT NULL,
    "techStack" JSONB NOT NULL,
    "timeline" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "docHealth" DOUBLE PRECISION,
    "securityHealth" DOUBLE PRECISION,
    "performanceHealth" DOUBLE PRECISION,
    "maintainabilityHealth" DOUBLE PRECISION,
    "overallHealth" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightReport" (
    "id" TEXT NOT NULL,
    "projectInsightsId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "reportPath" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsightReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_userCode_key" ON "user"("userCode");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "Repository_userId_idx" ON "Repository"("userId");

-- CreateIndex
CREATE INDEX "Repository_createdAt_idx" ON "Repository"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Repository_userId_createdAt_idx" ON "Repository"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubUrl_userId_key" ON "Repository"("githubUrl", "userId");

-- CreateIndex
CREATE INDEX "RepositoryFile_repositoryId_idx" ON "RepositoryFile"("repositoryId");

-- CreateIndex
CREATE INDEX "RepositoryFile_repositoryId_extension_idx" ON "RepositoryFile"("repositoryId", "extension");

-- CreateIndex
CREATE INDEX "CodeChunk_fileId_idx" ON "CodeChunk"("fileId");

-- CreateIndex
CREATE INDEX "CodeSymbol_name_idx" ON "CodeSymbol"("name");

-- CreateIndex
CREATE INDEX "CodeSymbol_kind_idx" ON "CodeSymbol"("kind");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_repositoryId_idx" ON "Conversation"("repositoryId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- CreateIndex
CREATE INDEX "Team_slug_idx" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "Team_teamCode_idx" ON "Team"("teamCode");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "TeamInvitation_teamId_idx" ON "TeamInvitation"("teamId");

-- CreateIndex
CREATE INDEX "TeamInvitation_email_idx" ON "TeamInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_teamId_email_key" ON "TeamInvitation"("teamId", "email");

-- CreateIndex
CREATE INDEX "TeamRepository_teamId_idx" ON "TeamRepository"("teamId");

-- CreateIndex
CREATE INDEX "TeamRepository_repositoryId_idx" ON "TeamRepository"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRepository_teamId_repositoryId_key" ON "TeamRepository"("teamId", "repositoryId");

-- CreateIndex
CREATE INDEX "TeamActivity_teamId_idx" ON "TeamActivity"("teamId");

-- CreateIndex
CREATE INDEX "TeamActivity_teamId_createdAt_idx" ON "TeamActivity"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Comment_teamId_idx" ON "Comment"("teamId");

-- CreateIndex
CREATE INDEX "Comment_repositoryId_idx" ON "Comment"("repositoryId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_teamId_createdAt_idx" ON "Comment"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SharedDocument_teamId_idx" ON "SharedDocument"("teamId");

-- CreateIndex
CREATE INDEX "SharedDocument_teamId_updatedAt_idx" ON "SharedDocument"("teamId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "TeamChat_teamId_idx" ON "TeamChat"("teamId");

-- CreateIndex
CREATE INDEX "TeamChat_teamId_updatedAt_idx" ON "TeamChat"("teamId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "TeamMessage_chatId_idx" ON "TeamMessage"("chatId");

-- CreateIndex
CREATE INDEX "TeamMessage_chatId_createdAt_idx" ON "TeamMessage"("chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "TeamNotification_teamId_idx" ON "TeamNotification"("teamId");

-- CreateIndex
CREATE INDEX "TeamNotification_userId_idx" ON "TeamNotification"("userId");

-- CreateIndex
CREATE INDEX "TeamNotification_userId_read_idx" ON "TeamNotification"("userId", "read");

-- CreateIndex
CREATE INDEX "TeamNotification_teamId_createdAt_idx" ON "TeamNotification"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "GitHubIntegration_userId_idx" ON "GitHubIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubIntegration_userId_githubUrl_key" ON "GitHubIntegration"("userId", "githubUrl");

-- CreateIndex
CREATE INDEX "GitHubIntegrationRepository_integrationId_idx" ON "GitHubIntegrationRepository"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubIntegrationRepository_integrationId_owner_name_key" ON "GitHubIntegrationRepository"("integrationId", "owner", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubWebhookEvent_deliveryId_key" ON "GitHubWebhookEvent"("deliveryId");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_integrationId_idx" ON "GitHubWebhookEvent"("integrationId");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_eventType_idx" ON "GitHubWebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_createdAt_idx" ON "GitHubWebhookEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_isActive_idx" ON "Notification"("isActive");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "Documentation_repositoryId_idx" ON "Documentation"("repositoryId");

-- CreateIndex
CREATE INDEX "Documentation_createdAt_idx" ON "Documentation"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "CodeReview_repositoryId_idx" ON "CodeReview"("repositoryId");

-- CreateIndex
CREATE INDEX "CodeReview_teamId_idx" ON "CodeReview"("teamId");

-- CreateIndex
CREATE INDEX "CodeReview_userId_idx" ON "CodeReview"("userId");

-- CreateIndex
CREATE INDEX "CodeReview_createdAt_idx" ON "CodeReview"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "TestReport_repositoryId_idx" ON "TestReport"("repositoryId");

-- CreateIndex
CREATE INDEX "TestReport_teamId_idx" ON "TestReport"("teamId");

-- CreateIndex
CREATE INDEX "TestReport_userId_idx" ON "TestReport"("userId");

-- CreateIndex
CREATE INDEX "TestReport_createdAt_idx" ON "TestReport"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "DebugRun_userId_idx" ON "DebugRun"("userId");

-- CreateIndex
CREATE INDEX "DebugRun_repositoryId_idx" ON "DebugRun"("repositoryId");

-- CreateIndex
CREATE INDEX "DebugRun_status_idx" ON "DebugRun"("status");

-- CreateIndex
CREATE INDEX "DebugRun_createdAt_idx" ON "DebugRun"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "DebugFailure_debugRunId_idx" ON "DebugFailure"("debugRunId");

-- CreateIndex
CREATE INDEX "Diagnosis_debugRunId_idx" ON "Diagnosis"("debugRunId");

-- CreateIndex
CREATE INDEX "Patch_debugRunId_idx" ON "Patch"("debugRunId");

-- CreateIndex
CREATE INDEX "Patch_status_idx" ON "Patch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityScanResult_debugRunId_key" ON "SecurityScanResult"("debugRunId");

-- CreateIndex
CREATE INDEX "SecurityScanResult_debugRunId_idx" ON "SecurityScanResult"("debugRunId");

-- CreateIndex
CREATE INDEX "PerfBaseline_debugRunId_idx" ON "PerfBaseline"("debugRunId");

-- CreateIndex
CREATE INDEX "PerfComparison_debugRunId_idx" ON "PerfComparison"("debugRunId");

-- CreateIndex
CREATE INDEX "SupportMessage_status_idx" ON "SupportMessage"("status");

-- CreateIndex
CREATE INDEX "SupportMessage_userId_idx" ON "SupportMessage"("userId");

-- CreateIndex
CREATE INDEX "SupportMessage_createdAt_idx" ON "SupportMessage"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "BackupRecord_createdAt_idx" ON "BackupRecord"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInsights_repositoryId_key" ON "ProjectInsights"("repositoryId");

-- CreateIndex
CREATE INDEX "ProjectInsights_repositoryId_idx" ON "ProjectInsights"("repositoryId");

-- CreateIndex
CREATE INDEX "InsightReport_projectInsightsId_idx" ON "InsightReport"("projectInsightsId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryFile" ADD CONSTRAINT "RepositoryFile_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeChunk" ADD CONSTRAINT "CodeChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "RepositoryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSymbol" ADD CONSTRAINT "CodeSymbol_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "RepositoryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRepository" ADD CONSTRAINT "TeamRepository_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRepository" ADD CONSTRAINT "TeamRepository_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamChat" ADD CONSTRAINT "TeamChat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMessage" ADD CONSTRAINT "TeamMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TeamChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMessage" ADD CONSTRAINT "TeamMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamNotification" ADD CONSTRAINT "TeamNotification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamNotification" ADD CONSTRAINT "TeamNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubIntegration" ADD CONSTRAINT "GitHubIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubIntegrationRepository" ADD CONSTRAINT "GitHubIntegrationRepository_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "GitHubIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubWebhookEvent" ADD CONSTRAINT "GitHubWebhookEvent_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "GitHubIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentation" ADD CONSTRAINT "Documentation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReview" ADD CONSTRAINT "CodeReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReport" ADD CONSTRAINT "TestReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugRun" ADD CONSTRAINT "DebugRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugFailure" ADD CONSTRAINT "DebugFailure_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patch" ADD CONSTRAINT "Patch_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityScanResult" ADD CONSTRAINT "SecurityScanResult_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfBaseline" ADD CONSTRAINT "PerfBaseline_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfComparison" ADD CONSTRAINT "PerfComparison_debugRunId_fkey" FOREIGN KEY ("debugRunId") REFERENCES "DebugRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInsights" ADD CONSTRAINT "ProjectInsights_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightReport" ADD CONSTRAINT "InsightReport_projectInsightsId_fkey" FOREIGN KEY ("projectInsightsId") REFERENCES "ProjectInsights"("id") ON DELETE CASCADE ON UPDATE CASCADE;
