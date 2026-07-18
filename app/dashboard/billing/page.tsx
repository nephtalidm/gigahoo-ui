"use client"

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { PageHeader } from "@/components/dashboard/page-header"
import {
  createSetupIntent,
  getPaymentMethods,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getInvoices,
  getInvoicePdfLink,
  type PaymentMethod,
  type InvoiceData,
} from "@/lib/api"
import { formatDate } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/language-context"
import { Loader2, CheckCircle2, CreditCard, Trash2, Plus, Star, Download } from "lucide-react"

// Module-level promise so Stripe.js is loaded once and shared across renders.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// The actual card-collection form. Lives inside <Elements> so it can access the
// Stripe + Elements instances bound to the SetupIntent clientSecret.
function AddCardForm({
  onSuccess,
  onCancel,
}: {
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
    // Confirm the SetupIntent: this saves the card to the customer without a
    // redirect when the card doesn't require one (e.g. no 3DS challenge).
    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    })
    if (confirmError) {
      setError(confirmError.message ?? t("billing.cardError"))
      setSubmitting(false)
      return
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Plain card fields, always: no wallets and no Link-style takeovers — a user must
          always see number/expiry/CVC without needing to know what Stripe Link is. */}
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
          {t("billing.save")}
        </button>
      </div>
    </form>
  )
}

export default function BillingMethodsPage() {
  const { t } = useTranslation()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [defaultingId, setDefaultingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  // Billing history — invoices belong on the Billing page, next to the cards that pay them.
  const [invoices, setInvoices] = useState<InvoiceData[]>([])

  // Add-card flow state. We only mount <Elements> once we have a clientSecret.
  const [adding, setAdding] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [intentLoading, setIntentLoading] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)

  function refresh() {
    return getPaymentMethods()
      .then(setMethods)
      .catch(() => {})
  }

  useEffect(() => {
    getInvoices().then(setInvoices).catch(() => {})
    refresh().finally(() => setLoading(false))
  }, [])

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function openAddCard() {
    setAdding(true)
    setIntentLoading(true)
    setIntentError(null)
    setClientSecret(null)
    try {
      const intent = await createSetupIntent()
      setProvider(intent.provider)
      setClientSecret(intent.clientSecret)
    } catch {
      setIntentError(t("billing.addCardFailed"))
    } finally {
      setIntentLoading(false)
    }
  }

  function closeAddCard() {
    setAdding(false)
    setClientSecret(null)
    setProvider(null)
    setIntentError(null)
  }

  async function onCardSaved() {
    await refresh()
    flashSaved()
    closeAddCard()
  }

  async function handleMakeDefault(m: PaymentMethod) {
    setDefaultingId(m.id)
    try {
      await setDefaultPaymentMethod(m.id, m.provider)
      await refresh()
    } catch {
      // Leave things as they are so the user can retry.
    } finally {
      setDefaultingId(null)
    }
  }

  async function handleRemove(m: PaymentMethod) {
    if (!window.confirm(t("billing.removeConfirm"))) return
    setRemovingId(m.id)
    try {
      await removePaymentMethod(m.id, m.provider)
      await refresh()
    } catch {
      // Leave the card in place so the user can retry.
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("billing.paymentMethodsTitle")}
          description={t("billing.paymentMethodsDescription")}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("billing.paymentMethodsTitle")}
        description={t("billing.paymentMethodsDescription")}
      />

      {/* Saved cards */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        {/* Status row with reserved height: the "card saved" flash gets its own line, so it
            never crowds the card list below and nothing shifts when it appears. */}
        <div className="mb-2 flex h-5 items-center justify-end pr-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {t("billing.cardSaved")}
            </span>
          )}
        </div>
        {methods.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("billing.noPaymentMethods")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {methods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CreditCard className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-medium capitalize text-foreground">
                      {m.brand} •••• {m.last4}
                      {m.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium normal-case text-primary">
                          <Star className="h-3 w-3" />
                          {t("billing.defaultCard")}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("billing.cardExpires", {
                        date: `${String(m.expMonth).padStart(2, "0")}/${String(m.expYear).slice(-2)}`,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!m.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleMakeDefault(m)}
                      disabled={defaultingId === m.id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {defaultingId === m.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                      {t("billing.makeDefault")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(m)}
                    disabled={removingId === m.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-destructive cursor-pointer transition-colors hover:bg-destructive/10 disabled:opacity-60"
                  >
                    {removingId === m.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {t("billing.remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add payment method */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground">{t("billing.addPaymentMethod")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("billing.addPaymentMethodHint")}
          </p>
        </div>

        {!adding ? (
          <button
            type="button"
            onClick={openAddCard}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm cursor-pointer transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t("billing.addPaymentMethod")}
          </button>
        ) : intentLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : intentError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-destructive">{intentError}</p>
            <button
              type="button"
              onClick={openAddCard}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground cursor-pointer transition-colors hover:bg-accent"
            >
              {t("billing.tryAgain")}
            </button>
          </div>
        ) : clientSecret && provider === "stripe" ? (
          // Stripe Elements is mounted with the SetupIntent clientSecret so the
          // PaymentElement collects + tokenizes the card against that intent.
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddCardForm onSuccess={onCardSaved} onCancel={closeAddCard} />
          </Elements>
        ) : clientSecret ? (
          // TODO: a non-Stripe provider's clientSecret was returned. When another
          // payment provider is added, branch here to render its own embedded
          // card-collection component instead of Stripe Elements.
          <p className="text-sm text-destructive">{t("billing.providerUnsupported")}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">{t("billing.billingHistory")}</h2>
        {invoices.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatDate(inv.dateUtc)}</p>
                  <p className="text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      inv.status.toLowerCase() === "paid"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : inv.status.toLowerCase() === "open"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {inv.status}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {inv.currency} {inv.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      // The tab must open IN the click gesture (popup blockers) — the fresh
                      // Stripe link is fetched after, then pointed into it.
                      const tab = window.open("", "_blank")
                      getInvoicePdfLink(inv.id)
                        .then(({ url }) => { if (tab) tab.location.href = url })
                        .catch(() => tab?.close())
                    }}
                    aria-label={t("billing.downloadInvoice", { number: inv.invoiceNumber })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground cursor-pointer transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("billing.noInvoices")}</p>
        )}
      </div>
    </div>
  )
}
