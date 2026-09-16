import { z } from "zod"

export const memberParams = z.object({
  orgSlug: z.string(),
  memberId: z.uuid(),
})

export const responseSuccessSchema = z.null()
