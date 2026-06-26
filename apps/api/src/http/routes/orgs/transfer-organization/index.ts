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

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/organizations/:slug/owner",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Transfer organization owrnership",
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

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions({
          userId,
          role: membership.role,
        })

        if (cannot("transfer_ownership", authOrganization)) {
          throw new UnauthorizedError(
            "You are not allowed to transfer ownership of this organization.",
          )
        }

        const { transferToUserId } = request.body

        const transferToMemberShip = await prisma.member.findUnique({
          where: {
            organizationId_userId: {
              organizationId: organization.id,
              userId: transferToUserId,
            },
          },
        })

        if (!transferToMemberShip) {
          throw new BadRequestError(
            "The specified user is not a member of this organization.",
          )
        }

        await prisma.$transaction([
          prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: "ADMIN",
            },
          }),
          prisma.organization.update({
            where: { id: organization.id },
            data: {
              ownerId: transferToUserId,
            },
          }),
        ])

        reply.status(204).send(null)
      },
    )
}
