import type { MongoAbility } from "@casl/ability"

import type { TProjectSubject, TUserSubject } from "./subjects"

type AppAbilities = TUserSubject | TProjectSubject | ["manage", "all"]

export type AppAbility = MongoAbility<AppAbilities>
