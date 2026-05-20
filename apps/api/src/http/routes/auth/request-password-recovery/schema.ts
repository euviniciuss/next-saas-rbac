import { z } from "zod"

export const requestPasswordRecoverySchema = z.object({
  email: z.email(),
})

export const reponseSucessSchema = z.null()
