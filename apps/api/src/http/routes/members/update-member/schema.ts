import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const memberParams = z.object({
  orgSlug: z.string(),
  memberId: z.uuid(),
})

export const memberBodySchema = z.object({
  role: roleSchema,
})

export const responseSuccessSchema = z.null()
