import { z } from "zod"

export const getOrganizationParams = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.object({
  organization: z.object({
    id: z.uuid(),
    name: z.string(),
    slug: z.string(),
    domain: z.string().nullable(),
    shouldAttachUsersByDomain: z.boolean(),
    avatarUrl: z.url().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    ownerId: z.uuid(),
  }),
})
