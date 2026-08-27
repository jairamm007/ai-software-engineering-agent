import { createAuthClient } from "better-auth/client";
import { API_ORIGIN } from "@/lib/axios";

export const authClient = createAuthClient({
  baseURL: API_ORIGIN || undefined,
  fetchOptions: {
    credentials: "include",
  },
});
