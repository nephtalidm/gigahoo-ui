import {
  Clock,
  Languages,
  FileText,
  ClipboardList,
  MessageCircleQuestion,
} from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "24/7 AI Receptionist",
    description:
      "Your AI receptionist answers every call, even when you're driving, working on-site, or after hours.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description:
      "Serve customers in multiple languages including English, Mandarin, Cantonese, Spanish, Japanese, and more.",
  },
  {
    icon: FileText,
    title: "Call Summaries",
    description: "Receive detailed summaries of every customer conversation.",
  },
  {
    icon: ClipboardList,
    title: "Customer Intake",
    description:
      "Collect names, phone numbers, addresses, and service details automatically.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Answers Questions About Services",
    description:
      "Provide instant answers to common questions about your services, service areas, and business information.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Features</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to capture every lead
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Purpose-built for plumbers, HVAC, electricians, and other home service pros.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
