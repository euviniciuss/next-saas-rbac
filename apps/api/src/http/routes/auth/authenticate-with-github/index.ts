import { prisma } from "@/lib/prisma"

import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"

import { BadRequestError } from "@/http/routes/_errors"
import { env } from "@saas/env"
import { z } from "zod"
import {
  accessTokenDataSchema,
  authenticateSchema,
  githubUserDataSchema,
  reponseSucessSchema,
} from "./schema"

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/login/github",
    {
      schema: {
        tags: ["Auth"],
        summary: "Authenticate with Github",
        body: authenticateSchema,
        response: {
          201: reponseSucessSchema,
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const githubAuthUrl = new URL(
        "https://github.com/login/oauth/access_token",
      )

      githubAuthUrl.searchParams.set("client_id", env.GITHUB_OAUTH_CLIENT_ID)
      githubAuthUrl.searchParams.set(
        "client_secret",
        env.GITHUB_OAUTH_CLIENT_SECRET,
      )
      githubAuthUrl.searchParams.set(
        "redirect_uri",
        env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
      )
      githubAuthUrl.searchParams.set("code", code)

      const githubAccessTokenResponse = await fetch(githubAuthUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })

      const githubAccessTokenData = await githubAccessTokenResponse.json()

      const { access_token } = z.parse(
        accessTokenDataSchema,
        githubAccessTokenData,
      )

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const githubUserData = await githubUserResponse.json()

      const {
        id: githubId,
        email,
        avatar_url: avatarUrl,
        name,
      } = z.parse(githubUserDataSchema, githubUserData)

      if (email === null) {
        throw new BadRequestError(
          "Your github account must have an public email to authenticate.",
        )
      }

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatarUrl,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: "GITHUB",
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: "GITHUB",
            providerAccountId: githubId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}

// 'https://github.com/login/oauth/authorize?client_id=Ov23liGxfUiHxdwUMelV&redirect_uri=http://localhost:3000/api/auth/callback&scope=user:email'
