import { auth } from "@/http/middlewares/auth"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { getUserMemeberShipParams, reponseSucessSchema } from "./schema"

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/membership",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Get user membership on organization",
          security: [{ bearerAuth: [] }],
          params: getUserMemeberShipParams,
          response: {
            200: reponseSucessSchema,
          },
        },
      },
      async (request) => {
        const { slug } = request.params

        const { membership } = await request.getUserMembership(slug)

        const { userId, ...dataMembership } = membership

        return {
          membership: dataMembership,
        }
      },
    )
}
