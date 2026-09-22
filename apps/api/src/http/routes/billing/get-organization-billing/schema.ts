import { z } from "zod"

export const getOrganizationParams = z.object({
  slug: z.string(),
})

export const reponseSucessSchema = z.object({
  billing: z.object({
    seats: z.object({
      amount: z.number(),
      unit: z.number(),
      price: z.number(),
    }),
    projects: z.object({
      amount: z.number(),
      unit: z.number(),
      price: z.number(),
    }),
    total: z.number(),
  }),
})
