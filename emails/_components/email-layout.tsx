import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components"
import { siteConfig } from "@/config/site"

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const header: React.CSSProperties = {
  padding: "32px 48px 0",
}

const headerText: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: "28px",
}

const content: React.CSSProperties = {
  padding: "0 48px",
}

const hr: React.CSSProperties = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const footer: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 48px",
}

type EmailLayoutProps = {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>{siteConfig.name}</Text>
          </Section>
          <Hr style={hr} />
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footer}>
              {siteConfig.name} &mdash; {siteConfig.url}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
