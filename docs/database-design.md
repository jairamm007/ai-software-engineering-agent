# Database Design

# Database: PostgreSQL + Prisma 7

Single PostgreSQL database. All user data is scoped by `userId`, team data by `teamId`. Cascade deletes remove children. Source of truth: `backend/prisma/schema.prisma`.

---

## 1. Auth (Better Auth) Tables

### user
Stores user accounts. Additional fields added via Better Auth `user.additionalFields`.

- `id` (String, cuid, PK)
- `name` String
- `email` String **unique**
- `emailVerified` Boolean (default false)
- `image` String?
- `bannerUrl` String?
- `bio` String?
- `role` String? (default "user", admin gating)
- `suspended` Boolean (default false)
- `linkedinUrl` / `githubUrl` / `portfolioUrl` String?
- `userCode` String **unique** (cuid)
- `createdAt` / `updatedAt`

Relations: sessions, accounts, repositories, conversations, preferences, ownedTeams, teamMemberships, activities, comments, teamMessages, teamNotifications, documents, githubIntegrations, auditLogs, codeReviews, testReports, supportMessages, debugRuns

### session
- `id`, `token` **unique**, `expiresAt`, `ipAddress?`, `userAgent?`, `userId`, `createdAt`, `updatedAt`
- `user` (Cascade)

### account
- `id`, `accountId`, `providerId`, `userId`, `accessToken?`, `refreshToken?`, `idToken?`, `accessTokenExpiresAt?`, `refreshTokenExpiresAt?`, `scope?`, `password?`, `createdAt`, `updatedAt`
- `user` (Cascade)

### verification
- `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`

---

## 2. Repository Domain

### Repository
- `id`, `name`, `githubUrl`, `localPath`, `userId`, `isFavorite` (default false), `createdAt`, `updatedAt`
- **`@@unique([githubUrl, userId])`** — same repo per user, no cross-user collision
- `@@index([userId])`, `@@index([createdAt desc])`, `@@index([userId, createdAt desc])`
- Relations: user, files, teamShares, docs, codeReviews, testReports, insights

### RepositoryFile
- `id`, `repositoryId`, `path`, `extension`, `size`
- Relations: repository (Cascade), chunks, symbols

### CodeChunk
- `id`, `fileId`, `content`, `startLine`, `endLine`
- Relation: file (Cascade)

### CodeSymbol
- `id`, `fileId`, `name`, `kind`, `exported`
- Relation: file (Cascade)

---

## 3. Chat / Conversations

### Conversation
- `id`, `title`, `userId`, `repositoryId?`, `createdAt`, `updatedAt`
- Relations: user (Cascade), messages

### Message
- `id`, `conversationId`, `role` ("user" | "assistant" | "system"), `content`, `createdAt`
- Relation: conversation (Cascade)

### UserPreference
- `id`, `userId` **unique**, `defaultModel` (default "gemini-2.5-flash"), `temperature` (default 0.3), `theme` (default "dark"), `accentColor` (default "violet")
- Relation: user (Cascade)

---

## 4. Team Collaboration

### Team
- `id`, `name`, `description?`, `slug` **unique**, `teamCode` **unique** (cuid), `logo?`, `visibility` (default "private"), `ownerId`, `createdAt`, `updatedAt`
- Relations: owner, members, invitations, repositories, activities, comments, chats, notifications, documents, codeReviews, testReports

### TeamMember
- `id`, `teamId`, `userId`, `role` (owner | admin | member | viewer, default "member"), `joinedAt`
- **`@@unique([teamId, userId])`**
- Relations: team (Cascade), user (Cascade)

### TeamInvitation
- `id`, `teamId`, `email`, `role` (default "member"), `invitedBy`, `status` (pending | accepted | rejected | expired), `expiresAt`, `createdAt`
- **`@@unique([teamId, email])`**

### TeamRepository
- `id`, `teamId`, `repositoryId`, `sharedBy`, `permission` (read | write | admin, default "read"), `sharedAt`
- **`@@unique([teamId, repositoryId])`**

### TeamActivity
- `id`, `teamId`, `userId`, `action`, `details?`, `createdAt`

### Comment
- `id`, `teamId`, `userId`, `repositoryId?`, `parentCommentId?`, `content`, `mentions` (String[]), `resolved`, `createdAt`, `updatedAt`

### SharedDocument
- `id`, `teamId`, `authorId`, `title`, `content?`, `format` (markdown | pdf), `status` (draft | published | archived), `createdAt`, `updatedAt`

### TeamChat
- `id`, `teamId`, `title?`, `createdAt`, `updatedAt`

### TeamMessage
- `id`, `chatId`, `userId`, `role`, `content`, `createdAt`

### TeamNotification
- `id`, `teamId`, `userId`, `type`, `title`, `message`, `read` (default false), `linkTo?`, `createdAt`

---

## 5. GitHub Integration

### GitHubIntegration
- `id`, `userId`, `githubUrl`, `token` (encrypted PAT), `isActive` (default true), `lastSyncAt?`, `createdAt`, `updatedAt`
- **`@@unique([userId, githubUrl])`**

### GitHubIntegrationRepository
- `id`, `integrationId`, `owner`, `name`, `fullName`, `description?`, `defaultBranch`, `isPrivate`, `language?`, `starsCount`, `forksCount`, `openIssuesCount`, `lastSyncAt?`, `createdAt`, `updatedAt`
- **`@@unique([integrationId, owner, name])`**

### GitHubWebhookEvent
- `id`, `integrationId`, `eventType`, `action?`, `deliveryId?` **unique**, `repositoryOwner?`, `repositoryName?`, `payload` (Json), `processedAt?`, `createdAt`

---

## 6. Admin / Platform

### AuditLog
- `id`, `userId?`, `action`, `details?`, `ipAddress?`, `userAgent?`, `createdAt`
- `user` (SetNull on delete)

### Notification
- `id`, `title`, `message`, `type`, `isActive`, `createdAt`, `updatedAt`

### SystemSetting
- `id`, `key` **unique**, `value`

### BackupRecord
- `id`, `filename`, `size` (BigInt), `status`, `type`, `note?`, `createdAt`

### SupportMessage
- `id`, `userId?`, `subject`, `message`, `category` (feedback | bug | feature | other), `status` (open | in_progress | resolved | closed), `priority`, `reply?`, `repliedAt?`, `createdAt`, `updatedAt`

---

## 7. Docs / Code Review / Testing

### Documentation
- `id`, `repositoryId`, `title`, `content?`, `format`, `status` (generating | completed | failed), `createdAt`, `updatedAt`

### CodeReview
- `id`, `repositoryId`, `teamId?`, `userId?`, `status` (pending | running | completed | failed), `summary?`, `issuesFound`, `criticalCount`, `warningCount`, `infoCount`, `reportData?` (JSON string), `createdAt`, `updatedAt`

### TestReport
- `id`, `repositoryId`, `teamId?`, `userId?`, `status`, `totalTests`, `passedTests`, `failedTests`, `skippedTests`, `coverage?`, `reportData?`, `createdAt`, `updatedAt`

---

## 8. RepoVerify Pipeline (Debug / Codegen / Security / Performance)

### DebugRun
- `id`, `userId`, `repositoryId?`, `repoName?`, `repoUrl?`, `branch?`, `status` (queued | running | done | failed), `stage` (debug | codegen | security | performance), `stackDetected?`, `failureCount`, `currentAttempt`, `summary?`, `createdAt`, `updatedAt`
- Relations: failures, diagnoses, patches, security, baselines, comparisons

### DebugFailure
- `id`, `debugRunId`, `testName?`, `testFile?`, `errorType?`, `errorMessage?`, `stackTrace?`, `implicatedFiles?` (Json), `createdAt`

### Diagnosis
- `id`, `debugRunId`, `failureId?`, `reasoning`, `rootCauseFile?`, `rootCauseLine?`, `confidence`, `modelUsed?`, `createdAt`

### Patch
- `id`, `debugRunId`, `attemptNumber`, `diffText`, `summary?`, `filesTouched?` (Json), `status` (proposed | applied | reverted | rejected), `testResult?`, `testOutput?`, `createdAt`, `updatedAt`

### SecurityScanResult
- `id`, `debugRunId` **unique**, `tool` (bandit | semgrep | gitleaks | osv), `summary?`, `findings?` (Json), `blocked`, `status`, `createdAt`, `updatedAt`

### PerfBaseline
- `id`, `debugRunId`, `stage` (pre | post), `timeMs?`, `memoryMb?`, `queryCount?`, `command?`, `heuristic?` (Json), `createdAt`

### PerfComparison
- `id`, `debugRunId`, `metric` (time_ms | memory_mb | query_count), `beforeValue?`, `afterValue?`, `pctChange?`, `flagged`, `createdAt`

---

## 9. Project Insights

### ProjectInsights
- `id`, `repositoryId` **unique**, `summary` (Json), `overview`, `architecture` (Json), `modules` (Json), `dependencies` (Json), `techStack` (Json), `timeline` (Json), `recommendations` (Json), `docHealth?`, `securityHealth?`, `performanceHealth?`, `maintainabilityHealth?`, `overallHealth?`, `createdAt`, `updatedAt`
- Relations: repository, reports

### InsightReport
- `id`, `projectInsightsId`, `format` (pdf | markdown), `filename`, `reportPath`, `size` (BigInt), `createdAt`

---

## Relationships Overview

```
user (1) ───< session / account / Repository / Conversation / UserPreference /
               GitHubIntegration / DebugRun / SupportMessage
user (1) ───< Team (owner) ───< TeamMember / TeamInvitation / TeamRepository /
               TeamActivity / Comment / SharedDocument / TeamChat / TeamNotification
Repository (1) ───< RepositoryFile ───< CodeChunk / CodeSymbol
Repository (1) ───< Documentation / CodeReview / TestReport
Repository (1) ───1 ProjectInsights ───< InsightReport
DebugRun (1) ───< DebugFailure / Diagnosis / Patch / PerfBaseline / PerfComparison
DebugRun (1) ───1 SecurityScanResult
GitHubIntegration (1) ───< GitHubIntegrationRepository / GitHubWebhookEvent
```

## Isolation & Concurrency Notes

- Every user-owned row carries `userId`; queries filter by it.
- Compound unique constraints (`Repository.githubUrl_userId`, `TeamMember.teamId_userId`, `TeamRepository.teamId_repositoryId`, `TeamInvitation.teamId_email`, `GitHubIntegration.userId_githubUrl`) prevent duplicate/colliding rows.
- Cascade deletes ensure no orphaned children.
- `CodeSymbol` and `RepositoryFile` are indexed for search/analysis lookups.
