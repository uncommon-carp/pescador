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

const note: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "16px 0",
}

type InvitationEmailProps = {
  orgName: string
  role: string
  invitedByEmail: string
  joinUrl: string
}

export function InvitationEmail({
  orgName,
  role,
  invitedByEmail,
  joinUrl,
}: InvitationEmailProps) {
  return (
    <EmailLayout preview={`You've been invited to join ${orgName}`}>
      <Text style={heading}>You&apos;re Invited!</Text>
      <Text style={paragraph}>
        {invitedByEmail} has invited you to join <strong>{orgName}</strong> as a{" "}
        <strong>{role}</strong>.
      </Text>
      <Link href={joinUrl} style={button}>
        Accept Invitation
      </Link>
      <Text style={note}>This invitation expires in 7 days.</Text>
    </EmailLayout>
  )
}

export default InvitationEmail
