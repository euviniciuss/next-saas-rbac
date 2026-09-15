import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { projectParams, responseSuccessSchema } from "./schema"

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/organizations/:orgSlug/projects",
      {
        schema: {
          tags: ["Projects"],
          summary: "Get all organization projects",
          security: [{ bearerAuth: [] }],
          params: projectParams,
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

        if (cannot("get", "Project")) {
          throw new UnauthorizedError(
            `You're not allowed to get organization projects.`,
          )
        }

        const projects = await prisma.project.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            organizationId: organization.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        if (!projects) {
          throw new BadRequestError("Projects not found.")
        }

        return reply.status(200).send({ projects })
      },
    )
}
