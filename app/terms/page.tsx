import { LegalLayout, LegalSection } from "@/components/legal-layout"

export const metadata = {
  title: "Terms of Service | Gigahoo",
  description: "The terms governing your use of Gigahoo.",
}

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="June 9, 2026">
      <LegalSection heading="Acceptance of Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of Gigahoo&apos;s AI call-answering
          service, website, and related applications (collectively, the &quot;Services&quot;). By creating an account or
          using the Services, you agree to be bound by these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="Use of the Services">
        <p>
          You must be at least 18 years old and capable of forming a binding contract to use the Services. You are
          responsible for all activity that occurs under your account and for keeping your credentials secure.
        </p>
        <p>
          You agree not to misuse the Services, including by attempting to access them through unauthorized means or
          using them for unlawful, fraudulent, or harmful purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Subscriptions and Billing">
        <p>
          Paid plans are billed in advance on a recurring basis. Minutes included in your plan reset each billing
          period. You can upgrade, downgrade, or cancel your plan at any time, and changes take effect at the start of
          the next billing period unless otherwise stated.
        </p>
      </LegalSection>

      <LegalSection heading="AI-Generated Content">
        <p>
          The Services use artificial intelligence to answer calls and generate transcripts and summaries. While we work
          to ensure accuracy, AI output may contain errors. You are responsible for reviewing important information and
          for how you use the output.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual Property">
        <p>
          The Services, including all software, content, and trademarks, are owned by Gigahoo or its licensors. These
          Terms do not grant you any rights to our intellectual property except as necessary to use the Services.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          We may suspend or terminate your access to the Services if you violate these Terms. You may stop using the
          Services at any time by closing your account.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Gigahoo is not liable for any indirect, incidental, or consequential
          damages arising from your use of the Services. The Services are provided &quot;as is&quot; without warranties
          of any kind.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>If you have questions about these Terms, contact us at legal@gigahoo.com.</p>
      </LegalSection>
    </LegalLayout>
  )
}
