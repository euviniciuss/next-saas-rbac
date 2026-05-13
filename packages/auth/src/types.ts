import type { ForcedSubject, MongoAbility } from "@casl/ability"
import type { actions, subjects } from "./constants"

type AppAbilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], "all">>
  ),
]

export type AppAbility = MongoAbility<AppAbilities>
