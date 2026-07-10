import {
  createBrowserRouter,
} from "react-router-dom";

import DashboardPage
from "@/pages/Dashboard/DashboardPage";

import RepositoryPage
from "@/pages/Repository/RepositoryPage";

import RepositoryDetailsPage from "@/pages/Repository/RepositoryDetailsPage";

export const router =
  createBrowserRouter([
    {
      path: "/",

      element:
        <DashboardPage />,
    },

    {
      path:
        "/repositories",

      element:
        <RepositoryPage />,
    },
    {
      path: "/repositories/:id",
      element: <RepositoryDetailsPage />,
    },
  ]);