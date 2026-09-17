import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const inviteParams = z.object({
  slug: z.string(),
})

export const responseSuccessSchema = z.object({
  invites: z.array(
    z.object({
      id: z.uuid(),
      role: roleSchema,
      email: z.email(),
      createdAt: z.date(),
      author: z
        .object({
          id: z.uuid(),
          name: z.string().nullable(),
        })
        .nullable(),
    }),
  ),
})
