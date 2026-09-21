import { z } from "zod"

export const inviteParams = z.object({
  inviteId: z.uuid(),
})

export const responseSuccessSchema = z.null()
