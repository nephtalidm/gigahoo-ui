"use client"

import type React from "react"
import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitContact } from "@/lib/api"
import { useTranslation } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { Mail, Phone, CheckCircle2, Loader2 } from "lucide-react"
import { z } from "zod"

type ContactField = "name" | "email" | "subject" | "message"
type ContactErrors = Partial<Record<ContactField, string>>

export default function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<ContactErrors>({})

  const contactSchema = z.object({
    name: z.string().min(1, t("contact.nameRequired")).max(100),
    email: z.string().email(t("contact.emailInvalid")).max(254),
    subject: z.string().min(1, t("contact.subjectRequired")).max(200),
    message: z.string().min(1, t("contact.messageRequired")).max(5000),
  })

  // Validate a single field live and update its error (clears when valid).
  function validateField(field: ContactField, value: string) {
    const result = contactSchema.shape[field].safeParse(value)
    setErrors((e) => ({
      ...e,
      [field]: result.success ? undefined : result.error.issues[0].message,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const data = { name, email, subject, message }
    const result = contactSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: ContactErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as ContactField
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      await submitContact(result.data)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.sendError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("contact.title")}
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-5">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <ContactDetail
                icon={<Mail className="h-5 w-5" />}
                label={t("contact.emailLabel")}
                value="contact@gigahoo.ai"
                href="mailto:contact@gigahoo.ai"
              />
              <ContactDetail
                icon={<Phone className="h-5 w-5" />}
                label={t("contact.phoneLabel")}
                value="+1 778 392 3021"
                href="tel:+17783923021"
              />
            </div>

            <div className="lg:col-span-3">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">{t("contact.successTitle")}</h2>
                  <p className="text-pretty text-muted-foreground">{t("contact.successBody")}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
                >
                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">{t("contact.nameLabel")}</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder={t("contact.namePlaceholder")}
                        value={name}
                        onChange={(e) => { setName(e.target.value); validateField("name", e.target.value) }}
                        maxLength={100}
                        className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && <p id="name-error" className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">{t("contact.emailLabel")}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={t("contact.emailPlaceholder")}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); validateField("email", e.target.value) }}
                        maxLength={254}
                        className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && <p id="email-error" className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">{t("contact.subjectLabel")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      placeholder={t("contact.subjectPlaceholder")}
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); validateField("subject", e.target.value) }}
                      maxLength={200}
                      className={cn(errors.subject && "border-destructive focus-visible:ring-destructive")}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                    />
                    {errors.subject && <p id="subject-error" className="text-xs text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">{t("contact.messageLabel")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder={t("contact.messagePlaceholder")}
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); validateField("message", e.target.value) }}
                      maxLength={5000}
                      className={cn(errors.message && "border-destructive focus-visible:ring-destructive")}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                    />
                    {errors.message && <p id="message-error" className="text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <Button type="submit" className="w-full sm:w-auto sm:self-start" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("contact.send")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ContactDetail({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {href ? (
          <a href={href} className="text-pretty font-medium text-foreground transition-colors hover:text-primary">
            {value}
          </a>
        ) : (
          <span className="text-pretty font-medium text-foreground">{value}</span>
        )}
      </div>
    </div>
  )
}
