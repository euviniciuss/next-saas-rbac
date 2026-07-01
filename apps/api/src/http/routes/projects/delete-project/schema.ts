import { z } from "zod"

export const projectParams = z.object({
  slug: z.string(),
  projectId: z.uuid(),
})

export const responseSuccessSchema = z.null()
