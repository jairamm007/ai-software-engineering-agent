import { z } from "zod";

export const githubParseSchema = z.object({
  url: z.string().url("Please provide a valid GitHub URL"),
});