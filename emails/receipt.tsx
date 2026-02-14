import { Text, Section } from "@react-email/components"
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

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  borderRadius: "5px",
  padding: "24px",
  margin: "24px 0",
}

const detailLabel: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.5px",
  lineHeight: "16px",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
}

const detailValue: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "24px",
  margin: "0 0 16px",
}

type ReceiptEmailProps = {
  orgName: string
  planName: string
  amount: string
}

export function ReceiptEmail({ orgName, planName, amount }: ReceiptEmailProps) {
  return (
    <EmailLayout preview={`Payment confirmed for ${orgName}`}>
      <Text style={heading}>Payment Confirmed</Text>
      <Text style={paragraph}>
        Your subscription for <strong>{orgName}</strong> has been activated.
      </Text>
      <Section style={detailsBox}>
        <Text style={detailLabel}>Organization</Text>
        <Text style={detailValue}>{orgName}</Text>
        <Text style={detailLabel}>Plan</Text>
        <Text style={detailValue}>{planName}</Text>
        <Text style={detailLabel}>Amount</Text>
        <Text style={{ ...detailValue, margin: "0" }}>{amount}/month</Text>
      </Section>
      <Text style={paragraph}>
        You can manage your subscription at any time from your organization
        billing settings.
      </Text>
    </EmailLayout>
  )
}

export default ReceiptEmail
