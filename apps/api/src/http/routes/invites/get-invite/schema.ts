import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const inviteParams = z.object({
  inviteId: z.uuid(),
})

export const responseSuccessSchema = z.object({
  invite: z.object({
    id: z.uuid(),
    role: roleSchema,
    email: z.email(),
    createdAt: z.date(),
    organization: z.object({
      name: z.string(),
    }),
    author: z
      .object({
        id: z.uuid(),
        name: z.string().nullable(),
        avatarUrl: z.url().nullable(),
      })
      .nullable(),
  }),
})
