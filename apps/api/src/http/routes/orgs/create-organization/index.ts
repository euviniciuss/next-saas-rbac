import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { createSlug } from "@/utils"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError } from "../../_errors"
import { organizationSchema, reponseSucessSchema } from "./schema"

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organization",
      {
        schema: {
          tags: ["Organization"],
          summary: "Create a new organization",
          security: [{ bearerAuth: [] }],
          body: organizationSchema,
          response: {
            201: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, domain, shouldAttachUsersByDomain } = request.body

        if (domain) {
          const organizationByDomain = await prisma.organization.findUnique({
            where: {
              domain,
            },
          })

          if (organizationByDomain) {
            throw new BadRequestError(
              "Another organization with same domain already exists.",
            )
          }
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            slug: createSlug(name),
            domain,
            shouldAttachUsersByDomain,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: "ADMIN",
              },
            },
          },
        })

        reply.status(201).send({ organizationId: organization.id })
      },
    )
}
