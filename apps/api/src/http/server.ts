import fastifyCors from "@fastify/cors"
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"

import fastifyJwt from "@fastify/jwt"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUI from "@fastify/swagger-ui"
import { env } from "@saas/env"
import { fastify } from "fastify"
import { errorHandler } from "./error-handler"
import {
  authenticateWithGithub,
  authenticateWithPassword,
  createAccount,
  getProfile,
  requestPasswordRecovery,
  resetPassword,
} from "./routes/auth"

import {
  createOrganization,
  getMembership,
  getOrganization,
  getOrganizations,
  shutdownOrganization,
  transferOrganization,
  updateOrganization,
} from "./routes/orgs"

import { getMembers, removeMember, updateMember } from "./routes/members"

import { createInvite, getInvite, getInvites } from "./routes/invites"
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "./routes/projects"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Next.js SaaS",
      description: "Full Stack Saas app with multi-tenant & RBAC.",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)

// Authenticate routes
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(authenticateWithGithub)
app.register(getProfile)
app.register(requestPasswordRecovery)
app.register(resetPassword)

// Organization routes
app.register(createOrganization)
app.register(getMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

// Project routes
app.register(createProject)
app.register(deleteProject)
app.register(getProjects)
app.register(getProject)
app.register(updateProject)

// Members routes
app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

// Invites routes
app.register(createInvite)
app.register(getInvite)
app.register(getInvites)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log("HTTP server running 🚀")
})
