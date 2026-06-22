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
import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react"
import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address").max(254),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
})

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }

    const result = contactSchema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues[0].message)
      setLoading(false)
      return
    }

    try {
      await submitContact(result.data)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
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
              Get in touch
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Have a question about Gigahoo or need help getting started? Send us a message and our team will get back to
              you within one business day.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-5">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <ContactDetail
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value="support@gigahoo.com"
                href="mailto:support@gigahoo.com"
              />
              <ContactDetail
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                value="+1 (888) 555-0142"
                href="tel:+18885550142"
              />
              <ContactDetail
                icon={<MapPin className="h-5 w-5" />}
                label="Office"
                value="1820 Market St, Suite 200, San Francisco, CA 94102"
              />
            </div>

            <div className="lg:col-span-3">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Message sent</h2>
                  <p className="text-pretty text-muted-foreground">
                    Thanks for reaching out. We&apos;ll be in touch soon.
                  </p>
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
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required placeholder="Jane Smith" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required placeholder="jane@business.com" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required placeholder="How can we help?" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" rows={5} required placeholder="Tell us a bit more..." />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto sm:self-start" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send message
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
