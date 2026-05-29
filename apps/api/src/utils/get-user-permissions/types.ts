import type { TRole } from "@saas/auth"

export interface IGetUserPermissions {
  userId: string
  role: TRole
}
