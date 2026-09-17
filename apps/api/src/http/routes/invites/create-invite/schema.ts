import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const inviteBodyParamsSchema = z.object({
  email: z.email(),
  role: roleSchema,
})

export const inviteParams = z.object({
  slug: z.string(),
})

export const responseSuccessSchema = z.object({
  inviteId: z.uuid(),
})
