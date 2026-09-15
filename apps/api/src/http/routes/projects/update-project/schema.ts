import { z } from "zod"

export const projectBodyParamsSchema = z.object({
  name: z.string(),
  description: z.string(),
})

export const projectParams = z.object({
  slug: z.string(),
  projectId: z.uuid(),
})

export const responseSuccessSchema = z.null()
