import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"
import { createSlug } from "@/utils"
import { getUserPermissions } from "@/utils/get-user-permissions"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { UnauthorizedError } from "../../_errors"
import { projectParams, projectSchema, responseSuccessSchema } from "./schema"

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/organizations/:slug/projects",
      {
        schema: {
          tags: ["Projects"],
          summary: "Create a new project",
          security: [{ bearerAuth: [] }],
          body: projectSchema,
          params: projectParams,
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

        if (cannot("create", "Project")) {
          throw new UnauthorizedError(
            `You're not allowed to create new projects.`,
          )
        }

        const { name, description } = request.body

        const project = await prisma.project.create({
          data: {
            name,
            description,
            slug: createSlug(name),
            organizationId: organization.id,
            ownerId: userId,
          },
        })

        reply.status(201).send({ projectId: project.id })
      },
    )
}
