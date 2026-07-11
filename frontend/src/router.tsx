import { createBrowserRouter } from "react-router-dom";

import DashboardPage from "@/pages/Dashboard/DashboardPage";

import RepositoryPage from "@/pages/Repository/RepositoryPage";
import RepositoryDetailsPage from "@/pages/Repository/RepositoryDetailsPage";

import RepositoryChatPage from "@/pages/Repository/Chat/RepositoryChatPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
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
]);