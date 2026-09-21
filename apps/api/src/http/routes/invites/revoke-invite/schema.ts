import { z } from "zod"

export const inviteParams = z.object({
  slug: z.string(),
  inviteId: z.uuid(),
})

export const responseSuccessSchema = z.null()
