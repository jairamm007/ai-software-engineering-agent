import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute, { GuestRoute } from "@/components/auth/ProtectedRoute";

const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmailPage"));
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
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

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyPage><LandingPage /></LazyPage>,
  },

  {
    path: "/landing",
    element: <LazyPage><LandingPage /></LazyPage>,
  },

  { path: "/login", element: <LazyPage><GuestRoute><LoginPage /></GuestRoute></LazyPage> },
  { path: "/register", element: <LazyPage><GuestRoute><RegisterPage /></GuestRoute></LazyPage> },
  { path: "/forgot-password", element: <LazyPage><GuestRoute><ForgotPasswordPage /></GuestRoute></LazyPage> },
  { path: "/reset-password", element: <LazyPage><ResetPasswordPage /></LazyPage> },
  { path: "/verify-email", element: <LazyPage><VerifyEmailPage /></LazyPage> },

  {
    path: "/dashboard",
    element: <LazyPage><ProtectedRoute><DashboardPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/chat",
    element: <LazyPage><ProtectedRoute><AIChatPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/settings",
    element: <LazyPage><ProtectedRoute><SettingsPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/profile",
    element: <LazyPage><ProtectedRoute><ProfilePage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories",
    element: <LazyPage><ProtectedRoute><RepositoryPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id",
    element: <LazyPage><ProtectedRoute><RepositoryDetailsPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/chat",
    element: <LazyPage><ProtectedRoute><RepositoryChatPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/overview",
    element: <LazyPage><ProtectedRoute><RepositoryOverviewPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/files",
    element: <LazyPage><ProtectedRoute><RepositoryFilesPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/review",
    element: <LazyPage><ProtectedRoute><RepositoryReviewPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/architecture",
    element: <LazyPage><ProtectedRoute><RepositoryArchitecturePage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/documentation",
    element: <LazyPage><ProtectedRoute><RepositoryDocumentationPage /></ProtectedRoute></LazyPage>,
  },

  {
    path: "/repositories/:id/dependency-graph",
    element: <LazyPage><ProtectedRoute><DependencyGraphPage /></ProtectedRoute></LazyPage>,
  },
]);
