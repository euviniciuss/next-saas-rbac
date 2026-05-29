import { z } from "zod"

export const organizationBodyParamsSchema = z.object({
  name: z.string(),
  domain: z.string().nullish(),
  shouldAttachUsersByDomain: z.boolean().optional(),
})

export const organizationParamsSchema = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.null()
