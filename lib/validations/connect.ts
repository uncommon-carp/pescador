import { z } from "zod"

export const connectOrgSchema = z.object({
  orgId: z.string().uuid({ message: "Invalid organization ID" }),
})

export type ConnectOrgInput = z.infer<typeof connectOrgSchema>
