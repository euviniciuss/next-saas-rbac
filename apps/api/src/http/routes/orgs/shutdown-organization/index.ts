import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

import { getUserPermissions } from "@/utils/get-user-permissions"
import { organizationSchema } from "@saas/auth"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import { UnauthorizedError } from "../../_errors"
import { organizationParamsSchema, reponseSucessSchema } from "./schema"

export async function shutdownOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      "/organizations/:slug",
      {
        schema: {
          tags: ["Organizations"],
          summary: "Shutdown organization",
          security: [{ bearerAuth: [] }],
          params: organizationParamsSchema,
          response: {
            204: reponseSucessSchema,
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()

        const { membership, organization } =
          await request.getUserMembership(slug)

        const authOrganization = organizationSchema.parse(organization)

        const { cannot } = getUserPermissions({
          userId,
          role: membership.role,
        })

        if (cannot("delete", authOrganization)) {
          throw new UnauthorizedError(
            "You are not allowed to delete this organization.",
          )
        }

        await prisma.organization.delete({
          where: { id: organization.id },
        })

        reply.status(204).send(null)
      },
    )
}
