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
  updateOrganization,
} from "./routes/orgs"

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

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log("HTTP server running 🚀")
})
