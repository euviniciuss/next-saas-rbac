import { z } from "zod"

export const authenticateSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export const reponseSucessSchema = z.object({
  token: z.string(),
})

export const reponseErrorSchema = z.object({
  message: z.string(),
})
