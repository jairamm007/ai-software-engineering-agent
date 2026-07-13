import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import {
  RouterProvider,
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";

import "./index.css";

import { router } from "./router";

const client =
  new QueryClient();

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
