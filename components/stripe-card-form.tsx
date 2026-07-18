"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useTranslation } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"

// Stripe.js is loaded once and shared by every embedded payment surface.
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// The one in-app card form: confirms the mounted intent (a subscription's PaymentIntent)
// without leaving the page. Card-only, no wallets and no Link takeovers — the same policy
// everywhere a card is typed (signup, plan upgrade, saved cards).
export function StripeCardPayForm({
  submitLabel,
  onSuccess,
  onCancel,
}: {
  submitLabel: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)
    const { error: confirmError } = await stripe.confirmPayment({ elements, redirect: "if_required" })
    if (confirmError) {
      setError(confirmError.message ?? t("billing.cardError"))
      setSubmitting(false)
      return
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          paymentMethodOrder: ["card"],
          wallets: { applePay: "never", googlePay: "never" },
          terms: { card: "never" },
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-accent disabled:opacity-60"
        >
          {t("billing.cancel")}
        </button>
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm cursor-pointer transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
