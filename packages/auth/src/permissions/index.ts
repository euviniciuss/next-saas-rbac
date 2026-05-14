import type { TRole } from "../roles"
import type { TPermissionsByRole } from "./types"

export const permissions: Record<TRole, TPermissionsByRole> = {
  ADMIN(user, { can, cannot }) {
    can("manage", "all")
    cannot(["transfer_ownership", "update"], "Organization")
    can(["transfer_ownership", "update"], "Organization", {
      ownerId: { $eq: user.id },
    })
  },
  MEMBER(user, { can }) {
    can("get", "User")
    can(["create", "get"], "Project")
    can(["update", "delete"], "Project", { ownerId: { $eq: user.id } })
  },
  BILLING(_, { can }) {
    can("manage", "Billing")
  },
}
