import { auth } from "@/http/middlewares/auth"
import { BadRequestError } from "@/http/routes/_errors"
import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { reponseSucessSchema, requestPasswordRecoverySchema } from "./schema"

export async function requestPasswordRecovery(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/password/recovery",
      {
        schema: {
          tags: ["Auth"],
          summary: "Recovery password user",
          body: requestPasswordRecoverySchema,
          response: {
            201: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const { email } = request.body

        const userFromEmail = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!userFromEmail) {
          return reply.status(201).send(null)
        }

        const { id: code } = await prisma.token.create({
          data: {
            type: "PASSWORD_RECOVER",
            userId: userFromEmail.id,
          },
        })

        console.log("Recover password token: ", code)
        return reply.status(201).send(null)
      },
    )
}
