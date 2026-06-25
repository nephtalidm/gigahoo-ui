"use client"

import { LegalLayout, LegalSection } from "@/components/legal-layout"
import { useTranslation } from "@/contexts/language-context"

export function PrivacyPolicyContent() {
  const { t } = useTranslation()

  return (
    <LegalLayout title={t("legal.privacyTitle")} lastUpdated={t("legal.lastUpdatedDate")}>
      <LegalSection heading={t("legal.privacyOverviewHeading")}>
        <p>{t("legal.privacyOverviewBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyCollectHeading")}>
        <p>{t("legal.privacyCollectBody1")}</p>
        <p>{t("legal.privacyCollectBody2")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyUseHeading")}>
        <p>{t("legal.privacyUseBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyShareHeading")}>
        <p>{t("legal.privacyShareBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyRetentionHeading")}>
        <p>{t("legal.privacyRetentionBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyRightsHeading")}>
        <p>{t("legal.privacyRightsBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.privacyContactHeading")}>
        <p>{t("legal.privacyContactBody")}</p>
      </LegalSection>
    </LegalLayout>
  )
}
