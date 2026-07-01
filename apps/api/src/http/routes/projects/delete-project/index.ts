import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { getUserPermissions } from "@/utils/get-user-permissions"
import { projectSchema } from "@saas/auth"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { BadRequestError, UnauthorizedError } from "../../_errors"
import { projectParams, responseSuccessSchema } from "./schema"

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:slug/projects/:projectId",
      {
        schema: {
          tags: ["Projects"],
          summary: "Delete a project",
          security: [{ bearerAuth: [] }],
          params: projectParams,
          response: {
            204: responseSuccessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug, projectId } = request.params

        const userId = await request.getCurrentUserId()
        const { organization, membership } =
          await request.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError("Project not found.")
        }

        const { cannot } = getUserPermissions({ userId, role: membership.role })
        const authProject = projectSchema.parse(project)

        if (cannot("delete", authProject)) {
          throw new UnauthorizedError(
            `You're not allowed to delete this project.`,
          )
        }

        await prisma.project.delete({
          where: {
            id: projectId,
          },
        })

        reply.status(204).send(null)
      },
    )
}
