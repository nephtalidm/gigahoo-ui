"use client"

import { LegalLayout, LegalSection } from "@/components/legal-layout"
import { useTranslation } from "@/contexts/language-context"

export function TermsOfServiceContent() {
  const { t } = useTranslation()

  return (
    <LegalLayout title={t("legal.termsTitle")} lastUpdated={t("legal.lastUpdatedDate")}>
      <LegalSection heading={t("legal.termsAcceptanceHeading")}>
        <p>{t("legal.termsAcceptanceBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsUseHeading")}>
        <p>{t("legal.termsUseBody1")}</p>
        <p>{t("legal.termsUseBody2")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsBillingHeading")}>
        <p>{t("legal.termsBillingBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsAiHeading")}>
        <p>{t("legal.termsAiBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsIpHeading")}>
        <p>{t("legal.termsIpBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsTerminationHeading")}>
        <p>{t("legal.termsTerminationBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsLiabilityHeading")}>
        <p>{t("legal.termsLiabilityBody")}</p>
      </LegalSection>

      <LegalSection heading={t("legal.termsContactHeading")}>
        <p>{t("legal.termsContactBody")}</p>
      </LegalSection>
    </LegalLayout>
  )
}
