import type { MongoAbility } from "@casl/ability"

import type { z } from "zod"
import type { appAbilitiesSchema } from "./schema"

export type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
