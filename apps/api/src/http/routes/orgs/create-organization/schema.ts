import { z } from "zod"

export const organizationSchema = z.object({
  name: z.string(),
  domain: z.string().nullish(),
  shouldAttachUsersByDomain: z.boolean().optional(),
})

export const reponseSucessSchema = z.object({
  organizationId: z.string(),
})
