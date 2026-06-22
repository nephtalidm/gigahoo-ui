import { LegalLayout, LegalSection } from "@/components/legal-layout"

export const metadata = {
  title: "Privacy Policy | Gigahoo",
  description: "How Gigahoo collects, uses, and protects your information.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 9, 2026">
      <LegalSection heading="Overview">
        <p>
          This Privacy Policy explains how Gigahoo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses,
          and shares information about you when you use our AI call-answering service, website, and related
          applications (collectively, the &quot;Services&quot;). By using the Services, you agree to the practices
          described here.
        </p>
      </LegalSection>

      <LegalSection heading="Information We Collect">
        <p>
          We collect information you provide directly, such as your name, business details, email address, and phone
          number when you create an account. We also collect call recordings, transcripts, and related metadata
          generated when our AI answers calls on your behalf.
        </p>
        <p>
          We automatically collect certain technical information, including device identifiers, log data, and usage
          information, to operate and improve the Services.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use Information">
        <p>
          We use your information to provide and maintain the Services, answer and route calls, generate transcripts and
          summaries, process payments, communicate with you, and improve the accuracy and quality of our AI.
        </p>
      </LegalSection>

      <LegalSection heading="How We Share Information">
        <p>
          We do not sell your personal information. We share information with service providers who help us operate the
          Services, when required by law, or to protect the rights and safety of our users and the public.
        </p>
      </LegalSection>

      <LegalSection heading="Data Retention">
        <p>
          We retain your information for as long as your account is active or as needed to provide the Services. You may
          request deletion of your data at any time, subject to legal and operational requirements.
        </p>
      </LegalSection>

      <LegalSection heading="Your Rights">
        <p>
          Depending on your location, you may have the right to access, correct, or delete your personal information, and
          to object to or restrict certain processing. To exercise these rights, contact us at privacy@gigahoo.com.
        </p>
      </LegalSection>

      <LegalSection heading="Contact Us">
        <p>
          If you have questions about this Privacy Policy, please reach out to us at privacy@gigahoo.com.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
