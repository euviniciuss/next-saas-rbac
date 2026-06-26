import { z } from "zod"

export const organizationParamsSchema = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.null()
