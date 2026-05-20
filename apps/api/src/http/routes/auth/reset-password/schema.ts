import { z } from "zod"

export const requestPasswordRecoverySchema = z.object({
  code: z.string(),
  password: z.string().min(6),
})

export const reponseSucessSchema = z.null()
