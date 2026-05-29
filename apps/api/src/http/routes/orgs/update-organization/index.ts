import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import { organizationSchema } from "@saas/auth"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import {
  organizationBodyParamsSchema,
  organizationParamsSchema,
  reponseSucessSchema,
} from "./schema"

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Update organization details",
          security: [{ bearerAuth: [] }],
          body: organizationBodyParamsSchema,
          params: organizationParamsSchema,
          response: {
            204: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(slug)

        const { name, domain, shouldAttachUsersByDomain } = request.body

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions({
          userId,
          role: membership.role,
        })

        if (cannot("update", authOrganization)) {
          throw new UnauthorizedError(
            "You are not allowed to update this organization.",
          )
        }

        if (domain) {
          const organizationByDomain = await prisma.organization.findFirst({
            where: {
              domain,
              id: {
                not: organization.id,
              },
            },
          })

          if (organizationByDomain) {
            throw new BadRequestError(
              "Another organization with same domain already exists.",
            )
          }
        }

        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            name,
            domain,
            shouldAttachUsersByDomain,
          },
        })

        reply.status(204).send(null)
      },
    )
}
