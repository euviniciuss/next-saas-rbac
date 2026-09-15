import { z } from "zod"

export const projectParams = z.object({
  orgSlug: z.string(),
})

export const responseSuccessSchema = z.object({
  projects: z.array(
    z.object({
      id: z.uuid(),
      description: z.string(),
      name: z.string(),
      slug: z.string(),
      avatarUrl: z.string().nullable(),
      organizationId: z.uuid(),
      ownerId: z.uuid(),
      createdAt: z.date(),
      owner: z.object({
        id: z.uuid(),
        name: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      }),
    }),
  ),
})
