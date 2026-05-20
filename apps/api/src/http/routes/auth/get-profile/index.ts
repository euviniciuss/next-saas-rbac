import { BadRequestError } from "@/http/routes/_errors"
import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { reponseSucessSchema } from "./schema"

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/profile",
    {
      schema: {
        tags: ["Auth"],
        summary: "Get authenticate user profile",

        response: {
          201: reponseSucessSchema,
        },
      },
    },
    async (request, reply) => {
      const { sub } = await request.jwtVerify<{ sub: string }>()

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
        where: {
          id: sub,
        },
      })

      if (!user) {
        throw new BadRequestError("User not found.")
      }

      return reply.send({ user })
    },
  )
}
