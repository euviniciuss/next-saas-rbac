import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { inviteParams, responseSuccessSchema } from "./schema"

export async function getInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:slug/invites",
      {
        schema: {
          tags: ["Invites"],
          summary: "Get all invites for an organization",
          security: [{ bearerAuth: [] }],
          params: inviteParams,
          response: {
            200: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("get", "Invite")) {
          throw new UnauthorizedError(
            `You're not allowed to get organization invites.`,
          )
        }

        const invites = await prisma.invite.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        return reply.status(200).send({ invites })
      },
    )
}
