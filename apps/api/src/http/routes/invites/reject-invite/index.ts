import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError } from "../../_errors"
import { inviteParams, responseSuccessSchema } from "./schema"

export async function rejectInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/invites/:inviteId/reject",
      {
        schema: {
          tags: ["Invites"],
          summary: "Reject invite",
          params: inviteParams,
          response: {
            204: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { inviteId } = request.params

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
          },
        })

        if (!invite) {
          throw new BadRequestError("Invite not found")
        }

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError("User not found")
        }

        if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
          throw new BadRequestError("This invite belongs to a different user.")
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
