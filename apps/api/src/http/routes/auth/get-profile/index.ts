import { auth } from "@/http/middlewares/auth"
import { BadRequestError } from "@/http/routes/_errors"
import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { reponseSucessSchema } from "./schema"

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/profile",
      {
        schema: {
          tags: ["Auth"],
          summary: "Get authenticate user profile",
          security: [{ bearerAuth: [] }],
          response: {
            201: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError("User not found.")
        }

        return reply.send({ user })
      },
    )
}
