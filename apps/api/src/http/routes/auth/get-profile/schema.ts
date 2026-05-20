import { email, z } from "zod"

export const authenticateSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const reponseSucessSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
  }),
})
