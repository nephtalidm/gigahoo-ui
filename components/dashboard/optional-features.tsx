"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Loader2, CheckCircle2 } from "lucide-react"
import { UpgradeCard } from "@/components/dashboard/upgrade-card"
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
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Enable ${title}`} />
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

function FeaturesPanel({ initial }: { initial: FeatureSettingsData | null }) {
  const init = initial ? toFormState(initial) : defaultState
  const [savedSettings, setSavedSettings] = useState<FeatureFormState>(init)
  const [settings, setSettings] = useState<FeatureFormState>(init)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  )

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

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
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
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Features</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {isDirty && !saved && <p className="text-sm text-muted-foreground">You have unsaved changes</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <FeatureCard
        title="Answer basic questions about your services"
        description="The AI responds to common questions using information you provide."
        enabled={settings.answerQuestions}
        onToggle={(value) => update("answerQuestions", value)}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="services-info">Services Offered</Label>
            <Textarea
              id="services-info"
              rows={4}
              value={settings.servicesInfo}
              onChange={(e) => update("servicesInfo", e.target.value)}
              placeholder="Describe your services, what's included, typical turnaround times, and anything else customers ask about."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="service-areas">Service Areas</Label>
            <Input
              id="service-areas"
              value={settings.serviceAreas}
              onChange={(e) => update("serviceAreas", e.target.value)}
              placeholder="e.g., San Francisco Bay Area, Downtown Seattle"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="business-hours-feature">Business Hours</Label>
            <Input
              id="business-hours-feature"
              value={settings.businessHours}
              onChange={(e) => update("businessHours", e.target.value)}
              placeholder="e.g., Mon-Fri 9am-5pm, Sat 10am-2pm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="emergency-availability">Emergency Availability</Label>
            <Input
              id="emergency-availability"
              value={settings.emergencyAvailability}
              onChange={(e) => update("emergencyAvailability", e.target.value)}
              placeholder="e.g., 24/7 emergency service available"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pricing-policy">Pricing Policy</Label>
            <Textarea
              id="pricing-policy"
              rows={3}
              value={settings.pricingPolicy}
              onChange={(e) => update("pricingPolicy", e.target.value)}
              placeholder="Describe your pricing structure, estimates, payment terms, etc."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="warranty-policy">Warranty Policy</Label>
            <Textarea
              id="warranty-policy"
              rows={3}
              value={settings.warrantyPolicy}
              onChange={(e) => update("warrantyPolicy", e.target.value)}
              placeholder="Describe your warranty terms, guarantees, etc."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="faq">Frequently Asked Questions</Label>
            <Textarea
              id="faq"
              rows={5}
              value={settings.frequentlyAskedQuestions}
              onChange={(e) => update("frequentlyAskedQuestions", e.target.value)}
              placeholder="List common questions and answers, one per line. Example:&#10;Q: Do you offer free estimates?&#10;A: Yes, we provide free estimates for all jobs."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="additional-info">Additional Business Information</Label>
            <Textarea
              id="additional-info"
              rows={4}
              value={settings.additionalBusinessInfo}
              onChange={(e) => update("additionalBusinessInfo", e.target.value)}
              placeholder="Any other information customers might ask about."
            />
          </div>
        </div>
      </FeatureCard>

      <FeatureCard
        title="Check if you serve the customer's area"
        description="The AI confirms whether a caller is within your service coverage."
        enabled={settings.serveArea}
        onToggle={(value) => update("serveArea", value)}
      >
        <div className="flex flex-col gap-6">
          <Label htmlFor="distance" className="text-base">
            Maximum distance
          </Label>

          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl"
              aria-label="Decrease distance by 10 kilometers"
              onClick={() => update("distanceKm", Math.max(1, settings.distanceKm - 10))}
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="flex min-w-[7rem] items-baseline justify-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <span className="text-3xl font-bold tabular-nums text-foreground">{settings.distanceKm}</span>
              <span className="text-base font-medium text-muted-foreground">km</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl"
              aria-label="Increase distance by 10 kilometers"
              onClick={() => update("distanceKm", Math.min(1000, settings.distanceKm + 10))}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <Slider
            id="distance"
            min={1}
            max={1000}
            value={[settings.distanceKm]}
            onValueChange={(value) => update("distanceKm", Array.isArray(value) ? value[0] : value)}
            aria-label="Maximum service distance in kilometers"
            className="py-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>1 km</span>
            <span>1000 km</span>
          </div>
        </div>
      </FeatureCard>

      <FeatureCard
        title="Quote inspection based on distance"
        description="Quote an inspection fee based on how far the customer is from you."
        enabled={settings.quoteInspection}
        onToggle={(value) => update("quoteInspection", value)}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="price-per-km">Price per km</Label>
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
            The AI multiplies this rate by the distance to quote an inspection fee.
          </p>
        </div>
      </FeatureCard>
    </div>
  )
}

export function OptionalFeatures({
  plan,
  initialSettings,
}: {
  plan: Plan
  initialSettings: FeatureSettingsData | null
}) {
  const hasFeatures = plan === "Business"

  return (
    <div className="w-full">
      {hasFeatures ? (
        <FeaturesPanel initial={initialSettings} />
      ) : (
        <UpgradeCard requiredPlan="Business" feature="Optional Features" />
      )}
    </div>
  )
}
