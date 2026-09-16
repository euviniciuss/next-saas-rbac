import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { UnauthorizedError } from "../../_errors"
import { memberBodySchema, memberParams, responseSuccessSchema } from "./schema"

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      "/organizations/:orgSlug/members/:memberId",
      {
        schema: {
          tags: ["Members"],
          summary: "Update a member",
          security: [{ bearerAuth: [] }],
          params: memberParams,
          body: memberBodySchema,
          response: {
            204: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, memberId } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("update", "User")) {
          throw new UnauthorizedError(
            `You're not allowed to update this member.`,
          )
        }

        const { role } = request.body

        await prisma.member.update({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        })

        return reply.status(204).send(null)
      },
    )
}
