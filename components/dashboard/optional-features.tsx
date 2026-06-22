"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"
import { UpgradeCard } from "@/components/dashboard/upgrade-card"
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

type FeatureSettings = {
  serveArea: boolean
  distance: number
  answerQuestions: boolean
  servicesInfo: string
  quoteInspection: boolean
  pricePerKm: string
}

const initialSettings: FeatureSettings = {
  serveArea: true,
  distance: 50,
  answerQuestions: false,
  servicesInfo: "",
  quoteInspection: false,
  pricePerKm: "",
}

function FeaturesPanel() {
  const [savedSettings, setSavedSettings] = useState<FeatureSettings>(initialSettings)
  const [settings, setSettings] = useState<FeatureSettings>(initialSettings)

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  )

  // Warn the customer if they try to leave with unsaved changes.
  useEffect(() => {
    if (!isDirty) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  function update<K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setSavedSettings(settings)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Features</h2>
        <div className="flex items-center gap-3">
          {isDirty && <p className="text-sm text-muted-foreground">You have unsaved changes</p>}
          <Button onClick={handleSave} disabled={!isDirty}>
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="services-info">Service information</Label>
          <Textarea
            id="services-info"
            rows={4}
            value={settings.servicesInfo}
            onChange={(e) => update("servicesInfo", e.target.value)}
            placeholder="Describe your services, what's included, typical turnaround times, and anything else customers ask about."
          />
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
              onClick={() => update("distance", Math.max(1, settings.distance - 10))}
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="flex min-w-[7rem] items-baseline justify-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <span className="text-3xl font-bold tabular-nums text-foreground">{settings.distance}</span>
              <span className="text-base font-medium text-muted-foreground">km</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl"
              aria-label="Increase distance by 10 kilometers"
              onClick={() => update("distance", Math.min(1000, settings.distance + 10))}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          <Slider
            id="distance"
            min={1}
            max={1000}
            value={[settings.distance]}
            onValueChange={(value) => update("distance", Array.isArray(value) ? value[0] : value)}
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

export function OptionalFeatures({ plan }: { plan: Plan }) {
  const hasFeatures = plan === "Business"

  return (
    <div className="w-full">
      {hasFeatures ? (
        <FeaturesPanel />
      ) : (
        <UpgradeCard requiredPlan="Business" feature="Optional Features" />
      )}
    </div>
  )
}
