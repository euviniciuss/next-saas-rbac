import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const reponseSucessSchema = z.object({
  organizations: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      slug: z.string(),
      avatarUrl: z.url().nullable(),
      role: roleSchema,
    }),
  ),
})
