import { z } from "zod"

export const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
})

export const projectParams = z.object({
  slug: z.string(),
})

export const responseSuccessSchema = z.object({
  projectId: z.uuid(),
})
