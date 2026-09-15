import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { projectParams, responseSuccessSchema } from "./schema"

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:orgSlug/projects/:projectSlug",
      {
        schema: {
          tags: ["Projects"],
          summary: "Get project details",
          security: [{ bearerAuth: [] }],
          params: projectParams,
          response: {
            200: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions({ userId, role: membership.role })

        if (cannot("get", "Project")) {
          throw new UnauthorizedError(
            `You're not allowed to get project details.`,
          )
        }

        const project = await prisma.project.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError("Project not found.")
        }

        return reply.status(200).send({ project })
      },
    )
}
