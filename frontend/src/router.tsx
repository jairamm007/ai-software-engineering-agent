import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute, { GuestRoute } from "@/components/auth/ProtectedRoute";
import PublicLayout from "@/layouts/PublicLayout";
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
  { path: "/architecture", element: <LazyPage><ProtectedRoute><ArchitecturePage /></ProtectedRoute></LazyPage> },
  { path: "/documentation", element: <LazyPage><ProtectedRoute><DocumentationPage /></ProtectedRoute></LazyPage> },
  { path: "/testing", element: <LazyPage><ProtectedRoute><TestingPage /></ProtectedRoute></LazyPage> },
  { path: "/analytics", element: <LazyPage><ProtectedRoute><AnalyticsPage /></ProtectedRoute></LazyPage> },
  { path: "/favorites", element: <LazyPage><ProtectedRoute><FavoritesPage /></ProtectedRoute></LazyPage> },
  { path: "/history", element: <LazyPage><ProtectedRoute><HistoryPage /></ProtectedRoute></LazyPage> },
  { path: "/settings", element: <LazyPage><ProtectedRoute><SettingsPage /></ProtectedRoute></LazyPage> },
  { path: "/profile", element: <LazyPage><ProtectedRoute><ProfilePage /></ProtectedRoute></LazyPage> },
  { path: "/github", element: <LazyPage><ProtectedRoute><GitHubIntegrationPage /></ProtectedRoute></LazyPage> },
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

  { path: "*", element: <NotFoundPage /> },
]);
