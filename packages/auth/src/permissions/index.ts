import type { TRole } from "../roles"
import type { TPermissionsByRole } from "./types"

export const permissions: Record<TRole, TPermissionsByRole> = {
  ADMIN(_, { can }) {
    can("manage", "all")
  },
  MEMBER(user, { can }) {
    can("delete", "Organization")
    can(["create", "get"], "Project")
    can(["update", "delete"], "Project", { ownerId: { $eq: user.id } })
  },
  BILLING() {},
}
