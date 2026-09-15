import { z } from "zod"

export const projectParams = z.object({
  orgSlug: z.string(),
  projectSlug: z.string(),
})

export const responseSuccessSchema = z.object({
  project: z.object({
    id: z.uuid(),
    description: z.string(),
    name: z.string(),
    slug: z.string(),
    avatarUrl: z.string().nullable(),
    organizationId: z.uuid(),
    ownerId: z.uuid(),
    owner: z.object({
      id: z.uuid(),
      name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
    }),
  }),
})
