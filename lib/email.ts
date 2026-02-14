import { Resend } from "resend"
import { siteConfig } from "@/config/site"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const DEFAULT_FROM =
  process.env.RESEND_FROM || `${siteConfig.name} <onboarding@resend.dev>`

type SendEmailOptions = {
  to: string
  subject: string
  react: React.ReactElement
}

export function sendEmail({ to, subject, react }: SendEmailOptions) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set, skipping email: ${subject}`)
    return
  }

  resend.emails
    .send({ from: DEFAULT_FROM, to, subject, react })
    .then(({ error }) => {
      if (error) {
        console.error(`[email] Failed to send "${subject}" to ${to}:`, error)
      }
    })
    .catch((err) => {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, err)
    })
}
