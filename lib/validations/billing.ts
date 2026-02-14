import { z } from "zod"

export const checkoutSchema = z.object({
  planKey: z.enum(["starter", "pro"], {
    message: "Invalid plan selected",
  }),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
