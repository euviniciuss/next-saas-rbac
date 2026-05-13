import type { TPermissionsByRole, TRole } from "./types"

export const permissions: Record<TRole, TPermissionsByRole> = {
  ADMIN(_, { can }) {
    can("manage", "all")
  },
  MEMBER(_, { can }) {
    can("invite", "User")
  },
}
