import { z } from "zod"

export const authenticateSchema = z.object({
  code: z.string(),
})

export const reponseSucessSchema = z.object({
  token: z.string(),
})

export const accessTokenDataSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  scope: z.string(),
})

export const githubUserDataSchema = z.object({
  id: z.number().int().transform(String),
  avatar_url: z.url(),
  name: z.string().nullable(),
  email: z.email(),
})
