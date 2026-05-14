import { z } from "zod"

export const userSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("invite"),
  ]),
  z.literal("User"),
])

export type TUserSubject = z.infer<typeof userSubject>
