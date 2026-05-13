import { defineAbilityFor } from "@saas/auth"

const ability = defineAbilityFor({ role: "MEMBER" })

const userCanInviteSomeoneElse = ability.can("manage", "User")

console.log("Can user invite someone else?", userCanInviteSomeoneElse)
