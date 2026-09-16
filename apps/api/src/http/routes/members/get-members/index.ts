import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { UnauthorizedError } from "../../_errors"
import { membersParams, responseSuccessSchema } from "./schema"

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:orgSlug/members",
      {
        schema: {
          tags: ["Members"],
          summary: "Get all organization members",
          security: [{ bearerAuth: [] }],
          params: membersParams,
          response: {
            200: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { orgSlug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("get", "User")) {
          throw new UnauthorizedError(
            `You're not allowed to get organization members.`,
          )
        }

        const members = await prisma.member.findMany({
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            role: "asc",
          },
        })

        const membersWithRoles = members.map(
          ({ user: { id: userId, ...user }, ...member }) => {
            return {
              ...user,
              ...member,
              userId,
            }
          },
        )

        return reply.status(200).send({ members: membersWithRoles })
      },
    )
}
