import { BadRequestError } from "@/http/routes/_errors"
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
        tags: ["Auth"],
        summary: "Create a new account",
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
        throw new BadRequestError("User with same e-mail already exists.")
      }

      const [, domain] = email.split("@")

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                  role: "MEMBER",
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send()
    },
  )
}
