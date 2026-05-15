import "dotenv/config"

import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  const formattedError = z.treeifyError(result.error)

  console.log("❌ Invalid environment variables:", formattedError)

  throw new Error("Invalid environment variables.")
}

export const env = result.data
