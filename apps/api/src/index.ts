import { defineAbilityFor, projectSchema } from "@saas/auth"

const ability = defineAbilityFor({ role: "MEMBER", id: "user-id" })

const project = projectSchema.parse({ id: "project", ownerId: "user" })

const userCanInviteSomeoneElse = ability.can("delete", project)

console.log("Can user invite someone else?", userCanInviteSomeoneElse)
