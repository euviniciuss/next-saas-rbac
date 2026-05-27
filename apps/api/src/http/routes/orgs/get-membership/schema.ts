import { roleSchema } from "@saas/auth"
import { z } from "zod"

export const getUserMemeberShipParams = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.object({
  membership: z.object({
    id: z.string(),
    role: roleSchema,
    organizationId: z.string(),
  }),
})
