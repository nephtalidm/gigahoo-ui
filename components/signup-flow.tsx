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
import { businessCategories, type Plan } from "@/lib/data"
import { createAccount, getCategories, type CategoryData } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import { z } from "zod"

const accountSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  businessPhone: z.string().min(7, "Please enter a valid phone number").max(30),
  email: z.string().email("Please enter a valid email address").max(254),
})

const plans: { name: Plan; planId: number; price: string; blurb: string; minutes: number }[] = [
  { name: "Free", planId: 1, price: "$0", blurb: "Answers calls", minutes: 25 },
  { name: "Starter", planId: 2, price: "$49", blurb: "More included minutes", minutes: 250 },
  { name: "Business", planId: 3, price: "$99", blurb: "Answers service questions", minutes: 1000 },
]

export function SignupFlow() {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated } = useAuth()
  const planParam = params.get("plan") as Plan | null
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    planParam && ["Free", "Starter", "Business"].includes(planParam) ? planParam : "Starter",
  )
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAuthenticated() {
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const businessName = formData.get("businessName") as string;
    const businessPhone = formData.get("businessPhone") as string;
    const email = formData.get("email") as string;

    const validation = accountSchema.safeParse({ businessName, businessPhone, email });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    const planObj = plans.find((p) => p.name === selectedPlan)!;

    try {
      const categories = await getCategories();
      const cat = categories.find((c) => c.name === category);
      if (!cat) {
        setError("Please select a valid category");
        setLoading(false);
        return;
      }

      await createAccount({
        businessName: validation.data.businessName,
        categoryId: cat.id,
        businessPhone: validation.data.businessPhone,
        phoneCountryCode: "US",
        email: validation.data.email,
        planId: planObj.planId,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
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
        <AuthMethods onAuthenticated={handleAuthenticated} />
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

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input name="businessName" id="businessName" required placeholder="Summit Plumbing" maxLength={200} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Business Category</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v)} required>
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
        <Input name="businessPhone" id="phone" type="tel" required placeholder="(555) 000-0000" maxLength={30} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input name="email" id="email" type="email" required placeholder="you@business.com" maxLength={254} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Plan</Label>
        <div className="grid gap-2">
          {plans.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelectedPlan(p.name)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 text-left transition-colors",
                selectedPlan === p.name
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent",
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.minutes} min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p.blurb}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{p.price}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selectedPlan === p.name
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {selectedPlan === p.name && <Check className="h-3 w-3" />}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  )
}
