import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { createSlug } from "@/utils"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError } from "../../_errors"
import { getOrganizationParams, reponseSucessSchema } from "./schema"

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Get details from organization",
          security: [{ bearerAuth: [] }],
          params: getOrganizationParams,
          response: {
            200: reponseSucessSchema,
          },
        },
      },
      async (request) => {
        const { slug } = request.params

        const { organization } = await request.getUserMembership(slug)

        return { organization }
      },
    )
}
