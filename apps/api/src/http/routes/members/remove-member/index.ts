import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { UnauthorizedError } from "../../_errors"
import { memberParams, responseSuccessSchema } from "./schema"

export async function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:orgSlug/members/:memberId",
      {
        schema: {
          tags: ["Members"],
          summary: "Remove a member from the organization",
          security: [{ bearerAuth: [] }],
          params: memberParams,
          response: {
            200: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, memberId } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("delete", "User")) {
          throw new UnauthorizedError(
            `You're not allowed to remove this member from the organization.`,
          )
        }

        await prisma.member.delete({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
        })

        return reply.status(200).send(null)
      },
    )
}
