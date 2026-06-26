import { z } from "zod"

export const organizationBodyParamsSchema = z.object({
  transferToUserId: z.uuid(),
})

export const organizationParamsSchema = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.null()
