import { createBrowserRouter } from "react-router-dom";

import DashboardPage from "@/pages/Dashboard/DashboardPage";
import LandingPage from "@/pages/Landing/LandingPage";
import AIChatPage from "@/pages/Chat/AIChatPage";

import RepositoryPage from "@/pages/Repository/RepositoryPage";
import RepositoryDetailsPage from "@/pages/Repository/RepositoryDetailsPage";

import RepositoryChatPage from "@/pages/Repository/Chat/RepositoryChatPage";
import RepositoryOverviewPage from "@/pages/Repository/Overview/RepositoryOverviewPage";
import RepositoryFilesPage from "@/pages/Repository/Files/RepositoryFilesPage";
import RepositoryReviewPage from "@/pages/Repository/Review/RepositoryReviewPage";
import RepositoryArchitecturePage from "@/pages/Repository/Architecture/RepositoryArchitecturePage";
import RepositoryDocumentationPage from "@/pages/Repository/Documentation/RepositoryDocumentationPage";
import DependencyGraphPage from "@/pages/Repository/DependencyGraph/DependencyGraphPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/landing",
    element: <LandingPage />,
  },

  {
    path: "/dashboard",
    element: <DashboardPage />,
  },

  {
    path: "/chat",
    element: <AIChatPage />,
  },

  {
    path: "/repositories",
    element: <RepositoryPage />,
  },

  {
    path: "/repositories/:id",
    element: <RepositoryDetailsPage />,
  },

  {
    path: "/repositories/:id/chat",
    element: <RepositoryChatPage />,
  },

  {
    path: "/repositories/:id/overview",
    element: <RepositoryOverviewPage />,
  },

  {
    path: "/repositories/:id/files",
    element: <RepositoryFilesPage />,
  },

  {
    path: "/repositories/:id/review",
    element: <RepositoryReviewPage />,
  },

  {
    path: "/repositories/:id/architecture",
    element: <RepositoryArchitecturePage />,
  },

  {
    path: "/repositories/:id/documentation",
    element: <RepositoryDocumentationPage />,
  },

  {
    path: "/repositories/:id/dependency-graph",
    element: <DependencyGraphPage />,
  },
]);
