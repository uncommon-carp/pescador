import { Text, Link } from "@react-email/components"
import { EmailLayout } from "./_components/email-layout"

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

const button: React.CSSProperties = {
  backgroundColor: "#556cd6",
  borderRadius: "5px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "50px",
  textAlign: "center" as const,
  textDecoration: "none",
  width: "200px",
  margin: "24px 0",
}

const highlight: React.CSSProperties = {
  color: "#e25950",
  fontWeight: 700,
}

type TrialEndingEmailProps = {
  orgName: string
  daysRemaining: number
  billingUrl: string
}

export function TrialEndingEmail({
  orgName,
  daysRemaining,
  billingUrl,
}: TrialEndingEmailProps) {
  return (
    <EmailLayout
      preview={`Your trial for ${orgName} ends in ${daysRemaining} days`}
    >
      <Text style={heading}>Your Trial is Ending Soon</Text>
      <Text style={paragraph}>
        Your trial for <strong>{orgName}</strong> ends in{" "}
        <span style={highlight}>
          {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
        </span>
        .
      </Text>
      <Text style={paragraph}>
        To continue using all features, make sure your billing information is up
        to date.
      </Text>
      <Link href={billingUrl} style={button}>
        Manage Billing
      </Link>
    </EmailLayout>
  )
}

export default TrialEndingEmail
