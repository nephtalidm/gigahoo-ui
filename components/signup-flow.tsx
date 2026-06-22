"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthMethods } from "@/components/auth-methods"
import { businessCategories, PLAN_MINUTES, type Plan } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const plans: { name: Plan; price: string; blurb: string }[] = [
  { name: "Free", price: "$0", blurb: "Answers calls" },
  { name: "Starter", price: "$49", blurb: "More included minutes" },
  { name: "Business", price: "$99", blurb: "Answers service questions" },
]

export function SignupFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const planParam = params.get("plan") as Plan | null
  const [step, setStep] = useState<1 | 2>(1)
  const [plan, setPlan] = useState<Plan>(
    planParam && ["Free", "Starter", "Business"].includes(planParam) ? planParam : "Starter",
  )
  const [category, setCategory] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/dashboard")
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start answering every call in minutes.
          </p>
        </div>
        <AuthMethods onAuthenticated={() => setStep(2)} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tell us about your business</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll use this to set up your AI receptionist.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input id="businessName" required placeholder="Summit Plumbing" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Business Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {businessCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Business Phone Number</Label>
        <Input id="phone" type="tel" required placeholder="(555) 000-0000" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" required placeholder="you@business.com" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Plan</Label>
        <div className="grid gap-2">
          {plans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setPlan(p.name)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                plan === p.name
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent",
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {PLAN_MINUTES[p.name]} min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p.blurb}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{p.price}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    plan === p.name
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {plan === p.name && <Check className="h-3 w-3" />}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Create account
      </Button>
    </form>
  )
}
