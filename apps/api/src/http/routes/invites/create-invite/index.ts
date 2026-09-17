import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import {
  inviteBodyParamsSchema,
  inviteParams,
  responseSuccessSchema,
} from "./schema"

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/invites",
      {
        schema: {
          tags: ["Invites"],
          summary: "Create a new invite",
          security: [{ bearerAuth: [] }],
          body: inviteBodyParamsSchema,
          params: inviteParams,
          response: {
            201: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("create", "Invite")) {
          throw new UnauthorizedError(
            `You're not allowed to create new invites.`,
          )
        }

        const { email, role } = request.body

        const [, domain] = email.split("@")

        if (
          organization.shouldAttachUsersByDomain &&
          organization.domain === domain
        ) {
          throw new BadRequestError(
            `Users with ${domain} domain can be added directly to the organization. No invite is needed.`,
          )
        }

        const inviteWithSameEmail = await prisma.invite.findUnique({
          where: {
            email_organizationId: {
              email,
              organizationId: organization.id,
            },
          },
        })

        if (inviteWithSameEmail) {
          throw new BadRequestError(
            "Another invite with same email already exists.",
          )
        }

        const memberWithSameEmail = await prisma.member.findFirst({
          where: {
            organizationId: organization.id,
            user: {
              email,
            },
          },
        })

        if (memberWithSameEmail) {
          throw new BadRequestError(
            "A member with the same email already exists in the organization.",
          )
        }

        const invite = await prisma.invite.create({
          data: {
            organizationId: organization.id,
            email,
            role,
            authorId: userId,
          },
        })

        return reply.status(201).send({ inviteId: invite.id })
      },
    )
}
