import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const membersParams = z.object({
  orgSlug: z.string(),
})

export const responseSuccessSchema = z.object({
  members: z.array(
    z.object({
      id: z.uuid(),
      userId: z.uuid(),
      role: roleSchema,
      name: z.string().nullable(),
      email: z.email(),
      avatarUrl: z.url().nullable(),
    }),
  ),
})
