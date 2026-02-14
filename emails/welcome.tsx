import { Text, Link } from "@react-email/components"
import { EmailLayout } from "./_components/email-layout"
import { siteConfig } from "@/config/site"

const heading: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "32px",
  margin: "16px 0",
}

const paragraph: React.CSSProperties = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
}

const link: React.CSSProperties = {
  color: "#556cd6",
  textDecoration: "underline",
}

type WelcomeEmailProps = {
  dashboardUrl: string
}

export function WelcomeEmail({ dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to ${siteConfig.name}!`}>
      <Text style={heading}>Welcome!</Text>
      <Text style={paragraph}>
        Thanks for signing up for {siteConfig.name}. We&apos;re glad to have you
        on board.
      </Text>
      <Text style={paragraph}>
        Get started by heading to your{" "}
        <Link href={dashboardUrl} style={link}>
          dashboard
        </Link>
        .
      </Text>
      <Text style={paragraph}>
        If you have any questions, just reply to this email. We&apos;re happy to
        help.
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
