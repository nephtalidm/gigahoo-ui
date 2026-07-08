"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"
import { UpgradeCard } from "@/components/dashboard/upgrade-card"
import { useTranslation } from "@/contexts/language-context"
import { updateFeatureSettings, type FeatureSettings as FeatureSettingsData } from "@/lib/api"
import type { Plan } from "@/lib/data"

function FeatureCard({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: (value: boolean) => void
  children?: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} aria-label={t("features.enable", { title })} />
      </div>

      {enabled && children && (
        <>
          <Separator className="my-6" />
          {children}
        </>
      )}
    </div>
  )
}

type FeatureFormState = {
  serveArea: boolean
  distanceKm: number
  answerQuestions: boolean
  servicesInfo: string
  serviceAreas: string
  businessHours: string
  emergencyAvailability: string
  pricingPolicy: string
  warrantyPolicy: string
  frequentlyAskedQuestions: string
  additionalBusinessInfo: string
  quoteInspection: boolean
  pricePerKm: string
}

function toFormState(s: FeatureSettingsData): FeatureFormState {
  return {
    serveArea: s.serveArea,
    distanceKm: s.distanceKm,
    answerQuestions: s.answerQuestions,
    servicesInfo: s.servicesInfo ?? "",
    serviceAreas: s.serviceAreas ?? "",
    businessHours: s.businessHours ?? "",
    emergencyAvailability: s.emergencyAvailability ?? "",
    pricingPolicy: s.pricingPolicy ?? "",
    warrantyPolicy: s.warrantyPolicy ?? "",
    frequentlyAskedQuestions: s.frequentlyAskedQuestions ?? "",
    additionalBusinessInfo: s.additionalBusinessInfo ?? "",
    quoteInspection: s.quoteInspection,
    pricePerKm: s.pricePerKm > 0 ? String(s.pricePerKm) : "",
  }
}

const defaultState: FeatureFormState = {
  serveArea: false,
  distanceKm: 50,
  answerQuestions: false,
  servicesInfo: "",
  serviceAreas: "",
  businessHours: "",
  emergencyAvailability: "",
  pricingPolicy: "",
  warrantyPolicy: "",
  frequentlyAskedQuestions: "",
  additionalBusinessInfo: "",
  quoteInspection: false,
  pricePerKm: "",
}

export type FeaturesPanelHandle = { save: () => Promise<void> }

const FeaturesPanel = forwardRef<FeaturesPanelHandle, {
  initial: FeatureSettingsData | null
  onDirtyChange?: (dirty: boolean) => void
}>(function FeaturesPanel({ initial, onDirtyChange }, ref) {
  const { t } = useTranslation()
  const init = initial ? toFormState(initial) : defaultState
  const [savedSettings, setSavedSettings] = useState<FeatureFormState>(init)
  const [settings, setSettings] = useState<FeatureFormState>(init)

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  )

  // Report dirty state up so the page's single Save button / unsaved guard can account for it.
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (!isDirty) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  function update<K extends keyof FeatureFormState>(key: K, value: FeatureFormState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // Persist via the page's single Save button (see SettingsView.handleSave). Throws on failure so
  // the parent surfaces the error alongside the rest of the Save.
  const doSave = useCallback(async () => {
    await updateFeatureSettings({
      answerQuestions: settings.answerQuestions,
      servicesInfo: settings.servicesInfo || null,
      serviceAreas: settings.serviceAreas || null,
      businessHours: settings.businessHours || null,
      emergencyAvailability: settings.emergencyAvailability || null,
      pricingPolicy: settings.pricingPolicy || null,
      warrantyPolicy: settings.warrantyPolicy || null,
      frequentlyAskedQuestions: settings.frequentlyAskedQuestions || null,
      additionalBusinessInfo: settings.additionalBusinessInfo || null,
      serveArea: settings.serveArea,
      distanceKm: settings.distanceKm,
      quoteInspection: settings.quoteInspection,
      pricePerKm: settings.pricePerKm ? parseFloat(settings.pricePerKm) : 0,
    })
    setSavedSettings(settings)
  }, [settings])

  useImperativeHandle(ref, () => ({ save: doSave }), [doSave])

  return (
    <div className="flex flex-col gap-5">
      <FeatureCard
        title={t("features.answerQuestionsTitle")}
        description={t("features.answerQuestionsDescription")}
        enabled={settings.answerQuestions}
        onToggle={(value) => update("answerQuestions", value)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="services-info">{t("features.servicesOffered")}</Label>
            <Textarea
              id="services-info"
              rows={4}
              value={settings.servicesInfo}
              onChange={(e) => update("servicesInfo", e.target.value)}
              placeholder={t("features.servicesOfferedPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="service-areas">{t("features.serviceAreas")}</Label>
            <Input
              id="service-areas"
              value={settings.serviceAreas}
              onChange={(e) => update("serviceAreas", e.target.value)}
              placeholder={t("features.serviceAreasPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="business-hours-feature">{t("features.businessHours")}</Label>
            <Input
              id="business-hours-feature"
              value={settings.businessHours}
              onChange={(e) => update("businessHours", e.target.value)}
              placeholder={t("features.businessHoursPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="emergency-availability">{t("features.emergencyAvailability")}</Label>
            <Input
              id="emergency-availability"
              value={settings.emergencyAvailability}
              onChange={(e) => update("emergencyAvailability", e.target.value)}
              placeholder={t("features.emergencyAvailabilityPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pricing-policy">{t("features.pricingPolicy")}</Label>
            <Textarea
              id="pricing-policy"
              rows={3}
              value={settings.pricingPolicy}
              onChange={(e) => update("pricingPolicy", e.target.value)}
              placeholder={t("features.pricingPolicyPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="warranty-policy">{t("features.warrantyPolicy")}</Label>
            <Textarea
              id="warranty-policy"
              rows={3}
              value={settings.warrantyPolicy}
              onChange={(e) => update("warrantyPolicy", e.target.value)}
              placeholder={t("features.warrantyPolicyPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="faq">{t("features.faq")}</Label>
            <Textarea
              id="faq"
              rows={5}
              value={settings.frequentlyAskedQuestions}
              onChange={(e) => update("frequentlyAskedQuestions", e.target.value)}
              placeholder={t("features.faqPlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="additional-info">{t("features.additionalInfo")}</Label>
            <Textarea
              id="additional-info"
              rows={4}
              value={settings.additionalBusinessInfo}
              onChange={(e) => update("additionalBusinessInfo", e.target.value)}
              placeholder={t("features.additionalInfoPlaceholder")}
            />
          </div>
        </div>
      </FeatureCard>

      <FeatureCard
        title={t("features.serveAreaTitle")}
        description={t("features.serveAreaDescription")}
        enabled={settings.serveArea}
        onToggle={(value) => update("serveArea", value)}
      >
        <div className="flex flex-col gap-6">
          <Label htmlFor="distance" className="text-base">
            {t("features.maximumDistance")}
          </Label>

          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-lg"
              aria-label={t("features.decreaseDistance")}
              onClick={() => update("distanceKm", Math.max(1, settings.distanceKm - 10))}
            >
              <Minus className="h-5 w-5" />
            </Button>

            <div className="flex min-w-[6rem] items-baseline justify-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-4 py-2">
              <span className="text-2xl font-bold tabular-nums text-foreground">{settings.distanceKm}</span>
              <span className="text-sm font-medium text-muted-foreground">km</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-lg"
              aria-label={t("features.increaseDistance")}
              onClick={() => update("distanceKm", Math.min(1000, settings.distanceKm + 10))}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <Slider
            id="distance"
            min={1}
            max={1000}
            value={[settings.distanceKm]}
            onValueChange={(value) => update("distanceKm", Array.isArray(value) ? value[0] : value)}
            aria-label={t("features.maxServiceDistanceAria")}
            className="py-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("features.distanceMin")}</span>
            <span>{t("features.distanceMax")}</span>
          </div>
        </div>
      </FeatureCard>

      <FeatureCard
        title={t("features.quoteInspectionTitle")}
        description={t("features.quoteInspectionDescription")}
        enabled={settings.quoteInspection}
        onToggle={(value) => update("quoteInspection", value)}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="price-per-km">{t("features.pricePerKm")}</Label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="price-per-km"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={settings.pricePerKm}
              onChange={(e) => update("pricePerKm", e.target.value)}
              placeholder="0.00"
              className="pl-7 pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/ km</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("features.pricePerKmHint")}
          </p>
        </div>
      </FeatureCard>
    </div>
  )
})

export const OptionalFeatures = forwardRef<FeaturesPanelHandle, {
  plan: Plan
  initialSettings: FeatureSettingsData | null
  onDirtyChange?: (dirty: boolean) => void
}>(function OptionalFeatures({ plan, initialSettings, onDirtyChange }, ref) {
  const { t } = useTranslation()
  const hasFeatures = plan === "Business"

  return (
    <div className="w-full">
      {hasFeatures ? (
        <FeaturesPanel ref={ref} initial={initialSettings} onDirtyChange={onDirtyChange} />
      ) : (
        <UpgradeCard requiredPlan="Business" feature={t("features.featureName")} />
      )}
    </div>
  )
})
