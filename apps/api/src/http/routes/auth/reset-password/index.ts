import { auth } from "@/http/middlewares/auth"
import { UnauthorizedError } from "@/http/routes/_errors"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { reponseSucessSchema, requestPasswordRecoverySchema } from "./schema"

export async function resetPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/password/reset",
      {
        schema: {
          tags: ["Auth"],
          summary: "Reset password user",
          body: requestPasswordRecoverySchema,
          response: {
            204: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const { code, password } = request.body

        const tokenFromCode = await prisma.token.findUnique({
          where: {
            id: code,
          },
        })

        if (!tokenFromCode) {
          throw new UnauthorizedError()
        }

        const passwordHash = await hash(password, 6)

        await prisma.user.update({
          where: {
            id: tokenFromCode.userId,
          },
          data: {
            passwordHash,
          },
        })

        return reply.status(204).send(null)
      },
    )
}
