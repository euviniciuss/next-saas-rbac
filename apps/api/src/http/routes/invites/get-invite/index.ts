import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { inviteParams, responseSuccessSchema } from "./schema"

export async function getInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/invites/:inviteId",
    {
      schema: {
        tags: ["Invites"],
        summary: "Get invite details",
        params: inviteParams,
        response: {
          200: responseSuccessSchema,
        },
      },
    },
    async (request, reply) => {
      const { inviteId } = request.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,
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
              avatarUrl: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
      })

      if (!invite) {
        throw new BadRequestError("Invite not found")
      }

      return reply.status(200).send({ invite })
    },
  )
}
