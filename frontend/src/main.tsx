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
import { AuthProvider } from "@/context/AuthContext";

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
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
