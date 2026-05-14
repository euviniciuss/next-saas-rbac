import { z } from "zod"
import {
  billingSubject,
  inviteSubject,
  organizationSubject,
  projectSubject,
  userSubject,
} from "./subjects"

export const appAbilitiesSchema = z.union([
  projectSubject,
  billingSubject,
  userSubject,
  inviteSubject,
  organizationSubject,

  z.tuple([z.literal("manage"), z.literal("all")]),
])
