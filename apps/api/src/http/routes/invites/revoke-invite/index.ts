import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { inviteParams, responseSuccessSchema } from "./schema"

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/invites/:inviteId",
      {
        schema: {
          tags: ["Invites"],
          summary: "Revoke invite",
          security: [{ bearerAuth: [] }],
          params: inviteParams,
          response: {
            204: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug, inviteId } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("delete", "Invite")) {
          throw new UnauthorizedError(`You're not allowed to delete an invite.`)
        }

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        if (!invite) {
          throw new BadRequestError("Invite not found.")
        }

        await prisma.invite.delete({
          where: {
            id: inviteId,
          },
        })

        return reply.status(204).send(null)
      },
    )
}
