import { defineAbilityFor, userSchema } from "@saas/auth"
import type { IGetUserPermissions } from "./types"

export function getUserPermissions({ userId, role }: IGetUserPermissions) {
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  const ability = defineAbilityFor(authUser)

  return ability
}
