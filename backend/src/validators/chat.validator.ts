import { z } from "zod";

export const chatSchema = z.object({
  repositoryId: z.string().min(1),
  question: z.string().min(1),
});