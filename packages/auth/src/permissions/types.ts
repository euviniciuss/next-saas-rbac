import type { AbilityBuilder } from "@casl/ability"
import type { User } from "../models/user"
import type { AppAbility } from "../types"

export type TPermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void
