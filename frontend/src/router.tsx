import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute, { GuestRoute } from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import AdminLayout from "@/layouts/AdminLayout";
import PublicLayout from "@/layouts/PublicLayout";
import TeamLayout from "@/layouts/TeamLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const FAQPage = lazy(() => import("@/pages/FAQ/FAQPage"));
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmailPage"));
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const SearchPage = lazy(() => import("@/pages/Dashboard/SearchPage"));
const CodeReviewPage = lazy(() => import("@/pages/Dashboard/CodeReviewPage"));
const CodeGenerationPage = lazy(() => import("@/pages/CodeGeneration/CodeGenerationPage"));
const DebuggingPage = lazy(() => import("@/pages/Debugging/DebuggingPage"));
const SecurityPage = lazy(() => import("@/pages/Security/SecurityPage"));
const ArchitecturePage = lazy(() => import("@/pages/Dashboard/ArchitecturePage"));
const DocumentationPage = lazy(() => import("@/pages/Dashboard/DocumentationPage"));
const TestingPage = lazy(() => import("@/pages/Dashboard/TestingPage"));
const AnalyticsPage = lazy(() => import("@/pages/Dashboard/AnalyticsPage"));
const FavoritesPage = lazy(() => import("@/pages/Dashboard/FavoritesPage"));
const HistoryPage = lazy(() => import("@/pages/Dashboard/HistoryPage"));
const AIChatPage = lazy(() => import("@/pages/Chat/AIChatPage"));
const SettingsPage = lazy(() => import("@/pages/Settings/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const RepositoryPage = lazy(() => import("@/pages/Repository/RepositoryPage"));
const RepositoryDetailsPage = lazy(() => import("@/pages/Repository/RepositoryDetailsPage"));
const RepositoryChatPage = lazy(() => import("@/pages/Repository/Chat/RepositoryChatPage"));
const RepositoryOverviewPage = lazy(() => import("@/pages/Repository/Overview/RepositoryOverviewPage"));
const RepositoryFilesPage = lazy(() => import("@/pages/Repository/Files/RepositoryFilesPage"));
const RepositoryReviewPage = lazy(() => import("@/pages/Repository/Review/RepositoryReviewPage"));
const RepositoryArchitecturePage = lazy(() => import("@/pages/Repository/Architecture/RepositoryArchitecturePage"));
const RepositoryDocumentationPage = lazy(() => import("@/pages/Repository/Documentation/RepositoryDocumentationPage"));
const DependencyGraphPage = lazy(() => import("@/pages/Repository/DependencyGraph/DependencyGraphPage"));
const RepositoryIntelligencePage = lazy(() => import("@/pages/Repository/Intelligence/RepositoryIntelligencePage"));
const RepositoryDocGeneratorPage = lazy(() => import("@/pages/Repository/DocumentationGenerator/RepositoryDocumentationGeneratorPage"));
const RepositorySemanticSearchPage = lazy(() => import("@/pages/Repository/SemanticSearch/RepositorySemanticSearchPage"));
const MultiAgentPage = lazy(() => import("@/pages/Repository/MultiAgent/MultiAgentPage"));
const RepositorySettingsPage = lazy(() => import("@/pages/Repository/RepositorySettingsPage"));
const GitHubIntegrationPage = lazy(() => import("@/pages/GitHub/GitHubIntegrationPage"));
const TeamsPage = lazy(() => import("@/pages/Teams/TeamsPage"));
const TeamDashboardPage = lazy(() => import("@/pages/Teams/TeamDashboardPage"));
const TeamMembersPage = lazy(() => import("@/pages/Teams/TeamMembersPage"));
const TeamReposPage = lazy(() => import("@/pages/Teams/TeamReposPage"));
const TeamChatPage = lazy(() => import("@/pages/Teams/TeamChatPage"));
const TeamDiscussionsPage = lazy(() => import("@/pages/Teams/TeamDiscussionsPage"));
const TeamDocumentationPage = lazy(() => import("@/pages/Teams/TeamDocumentationPage"));
const TeamCodeReviewsPage = lazy(() => import("@/pages/Teams/TeamCodeReviewsPage"));
const TeamTestingPage = lazy(() => import("@/pages/Teams/TeamTestingPage"));
const TeamAnalyticsPage = lazy(() => import("@/pages/Teams/TeamAnalyticsPage"));
const TeamActivityPage = lazy(() => import("@/pages/Teams/TeamActivityPage"));
const TeamNotificationsPage = lazy(() => import("@/pages/Teams/TeamNotificationsPage"));
const TeamSettingsPage = lazy(() => import("@/pages/Teams/TeamSettingsPage"));

const AdminLoginPage = lazy(() => import("@/pages/Admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("@/pages/Admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/Admin/AdminUsersPage"));
const AdminRepositoriesPage = lazy(() => import("@/pages/Admin/AdminRepositoriesPage"));
const AdminAIServicesPage = lazy(() => import("@/pages/Admin/AdminAIServicesPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/Admin/AdminAnalyticsPage"));
const AdminSecurityPage = lazy(() => import("@/pages/Admin/AdminSecurityPage"));
const AdminNotificationsPage = lazy(() => import("@/pages/Admin/AdminNotificationsPage"));
const AdminReportsPage = lazy(() => import("@/pages/Admin/AdminReportsPage"));
const AdminSettingsPage = lazy(() => import("@/pages/Admin/AdminSettingsPage"));
const AdminAccessDeniedPage = lazy(() => import("@/pages/Admin/AdminAccessDeniedPage"));
const AdminManagementPage = lazy(() => import("@/pages/Admin/AdminManagementPage"));
const AdminDocumentationPage = lazy(() => import("@/pages/Admin/AdminDocumentationPage"));
const AdminCodeReviewPage = lazy(() => import("@/pages/Admin/AdminCodeReviewPage"));
const AdminTestingPage = lazy(() => import("@/pages/Admin/AdminTestingPage"));
const AdminSearchPage = lazy(() => import("@/pages/Admin/AdminSearchPage"));
const AdminActivityLogsPage = lazy(() => import("@/pages/Admin/AdminActivityLogsPage"));
const AdminBackupPage = lazy(() => import("@/pages/Admin/AdminBackupPage"));
const AdminSupportPage = lazy(() => import("@/pages/Admin/AdminSupportPage"));
const AdminProfilePage = lazy(() => import("@/pages/Admin/AdminProfilePage"));

const DocsPage = lazy(() => import("@/pages/Info/DocsPage"));
const BlogPage = lazy(() => import("@/pages/Info/BlogPage"));
const ChangelogPage = lazy(() => import("@/pages/Info/ChangelogPage"));
const SupportPage = lazy(() => import("@/pages/Info/SupportPage"));
const AboutPage = lazy(() => import("@/pages/Info/AboutPage"));
const CareersPage = lazy(() => import("@/pages/Info/CareersPage"));
const PrivacyPage = lazy(() => import("@/pages/Info/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/Info/TermsPage"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 accent-border border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-6xl font-bold text-slate-900">404</h1>
        <p className="mb-6 text-lg text-slate-500">Page not found</p>
        <a
          href="/"
          className="inline-block rounded-lg accent-gradient px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LazyPage><LandingPage /></LazyPage> },
      { path: "/landing", element: <LazyPage><LandingPage /></LazyPage> },
      { path: "/faq", element: <LazyPage><FAQPage /></LazyPage> },
      { path: "/docs", element: <LazyPage><DocsPage /></LazyPage> },
      { path: "/blog", element: <LazyPage><BlogPage /></LazyPage> },
      { path: "/changelog", element: <LazyPage><ChangelogPage /></LazyPage> },
      { path: "/support", element: <LazyPage><SupportPage /></LazyPage> },
      { path: "/about", element: <LazyPage><AboutPage /></LazyPage> },
      { path: "/careers", element: <LazyPage><CareersPage /></LazyPage> },
      { path: "/privacy", element: <LazyPage><PrivacyPage /></LazyPage> },
      { path: "/terms", element: <LazyPage><TermsPage /></LazyPage> },
    ],
  },

  { path: "/login", element: <LazyPage><GuestRoute><LoginPage /></GuestRoute></LazyPage> },
  { path: "/register", element: <LazyPage><GuestRoute><RegisterPage /></GuestRoute></LazyPage> },
  { path: "/forgot-password", element: <LazyPage><GuestRoute><ForgotPasswordPage /></GuestRoute></LazyPage> },
  { path: "/reset-password", element: <LazyPage><ResetPasswordPage /></LazyPage> },
  { path: "/verify-email", element: <LazyPage><VerifyEmailPage /></LazyPage> },

  { path: "/dashboard", element: <LazyPage><ProtectedRoute><DashboardPage /></ProtectedRoute></LazyPage> },
  { path: "/search", element: <LazyPage><ProtectedRoute><SearchPage /></ProtectedRoute></LazyPage> },
  { path: "/chat", element: <LazyPage><ProtectedRoute><AIChatPage /></ProtectedRoute></LazyPage> },
  { path: "/code-review", element: <LazyPage><ProtectedRoute><CodeReviewPage /></ProtectedRoute></LazyPage> },
  { path: "/code-generation", element: <LazyPage><ProtectedRoute><CodeGenerationPage /></ProtectedRoute></LazyPage> },
  { path: "/debugging", element: <LazyPage><ProtectedRoute><DebuggingPage /></ProtectedRoute></LazyPage> },
  { path: "/security", element: <LazyPage><ProtectedRoute><SecurityPage /></ProtectedRoute></LazyPage> },
  { path: "/architecture", element: <LazyPage><ProtectedRoute><ArchitecturePage /></ProtectedRoute></LazyPage> },
  { path: "/documentation", element: <LazyPage><ProtectedRoute><DocumentationPage /></ProtectedRoute></LazyPage> },
  { path: "/testing", element: <LazyPage><ProtectedRoute><TestingPage /></ProtectedRoute></LazyPage> },
  { path: "/analytics", element: <LazyPage><ProtectedRoute><AnalyticsPage /></ProtectedRoute></LazyPage> },
  { path: "/favorites", element: <LazyPage><ProtectedRoute><FavoritesPage /></ProtectedRoute></LazyPage> },
  { path: "/history", element: <LazyPage><ProtectedRoute><HistoryPage /></ProtectedRoute></LazyPage> },
  { path: "/settings", element: <LazyPage><ProtectedRoute><SettingsPage /></ProtectedRoute></LazyPage> },
  { path: "/profile", element: <LazyPage><ProtectedRoute><ProfilePage /></ProtectedRoute></LazyPage> },
  { path: "/github", element: <LazyPage><ProtectedRoute><GitHubIntegrationPage /></ProtectedRoute></LazyPage> },
  { path: "/teams", element: <LazyPage><ProtectedRoute><TeamsPage /></ProtectedRoute></LazyPage> },
  {
    path: "/teams/:teamId",
    element: <LazyPage><ProtectedRoute><TeamLayout /></ProtectedRoute></LazyPage>,
    children: [
      { index: true, element: <TeamDashboardPage /> },
      { path: "members", element: <TeamMembersPage /> },
      { path: "repositories", element: <TeamReposPage /> },
      { path: "chat", element: <TeamChatPage /> },
      { path: "discussions", element: <TeamDiscussionsPage /> },
      { path: "documentation", element: <TeamDocumentationPage /> },
      { path: "code-reviews", element: <TeamCodeReviewsPage /> },
      { path: "testing", element: <TeamTestingPage /> },
      { path: "analytics", element: <TeamAnalyticsPage /> },
      { path: "activity", element: <TeamActivityPage /> },
      { path: "notifications", element: <TeamNotificationsPage /> },
      { path: "settings", element: <TeamSettingsPage /> },
    ],
  },
  { path: "/repositories", element: <LazyPage><ProtectedRoute><RepositoryPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id", element: <LazyPage><ProtectedRoute><RepositoryDetailsPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/chat", element: <LazyPage><ProtectedRoute><RepositoryChatPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/overview", element: <LazyPage><ProtectedRoute><RepositoryOverviewPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/files", element: <LazyPage><ProtectedRoute><RepositoryFilesPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/review", element: <LazyPage><ProtectedRoute><RepositoryReviewPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/architecture", element: <LazyPage><ProtectedRoute><RepositoryArchitecturePage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/documentation", element: <LazyPage><ProtectedRoute><RepositoryDocumentationPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/dependency-graph", element: <LazyPage><ProtectedRoute><DependencyGraphPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/intelligence", element: <LazyPage><ProtectedRoute><RepositoryIntelligencePage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/doc-generator", element: <LazyPage><ProtectedRoute><RepositoryDocGeneratorPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/semantic-search", element: <LazyPage><ProtectedRoute><RepositorySemanticSearchPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/multi-agent", element: <LazyPage><ProtectedRoute><MultiAgentPage /></ProtectedRoute></LazyPage> },
  { path: "/repositories/:id/settings", element: <LazyPage><ProtectedRoute><RepositorySettingsPage /></ProtectedRoute></LazyPage> },

  { path: "/admin/login", element: <LazyPage><AdminLoginPage /></LazyPage> },
  { path: "/admin/access-denied", element: <LazyPage><AdminAccessDeniedPage /></LazyPage> },
  { path: "/admin", element: <LazyPage><AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/users", element: <LazyPage><AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/repositories", element: <LazyPage><AdminRoute><AdminLayout><AdminRepositoriesPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/ai", element: <LazyPage><AdminRoute><AdminLayout><AdminAIServicesPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/analytics", element: <LazyPage><AdminRoute><AdminLayout><AdminAnalyticsPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/security", element: <LazyPage><AdminRoute><AdminLayout><AdminSecurityPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/notifications", element: <LazyPage><AdminRoute><AdminLayout><AdminNotificationsPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/reports", element: <LazyPage><AdminRoute><AdminLayout><AdminReportsPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/settings", element: <LazyPage><AdminRoute><AdminLayout><AdminSettingsPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/admins", element: <LazyPage><AdminRoute><AdminLayout><AdminManagementPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/documentation", element: <LazyPage><AdminRoute><AdminLayout><AdminDocumentationPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/code-reviews", element: <LazyPage><AdminRoute><AdminLayout><AdminCodeReviewPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/testing", element: <LazyPage><AdminRoute><AdminLayout><AdminTestingPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/search", element: <LazyPage><AdminRoute><AdminLayout><AdminSearchPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/activity-logs", element: <LazyPage><AdminRoute><AdminLayout><AdminActivityLogsPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/backup", element: <LazyPage><AdminRoute><AdminLayout><AdminBackupPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/support", element: <LazyPage><AdminRoute><AdminLayout><AdminSupportPage /></AdminLayout></AdminRoute></LazyPage> },
  { path: "/admin/profile", element: <LazyPage><AdminRoute><AdminLayout><AdminProfilePage /></AdminLayout></AdminRoute></LazyPage> },

  { path: "*", element: <NotFoundPage /> },
]);
