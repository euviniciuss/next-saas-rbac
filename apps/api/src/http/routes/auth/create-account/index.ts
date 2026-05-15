import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { usersSchema } from "./schema"

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        body: usersSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithEmail) {
        return reply
          .status(400)
          .send({ message: "User with same email already exists." })
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })

      return reply.status(201).send()
    },
  )
}
