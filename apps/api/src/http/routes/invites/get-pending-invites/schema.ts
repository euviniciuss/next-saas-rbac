import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const responseSuccessSchema = z.object({
  invites: z.array(
    z.object({
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
  ),
})
