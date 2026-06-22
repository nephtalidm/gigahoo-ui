import { PhoneForwarded, Bot, ClipboardList } from "lucide-react"

const steps = [
  {
    icon: PhoneForwarded,
    title: "Forward your business number",
    description: "Keep your existing number and forward incoming calls to Gigahoo in minutes.",
  },
  {
    icon: Bot,
    title: "The AI answers incoming calls",
    description: "Your AI receptionist greets callers, answers questions, and handles requests.",
  },
  {
    icon: ClipboardList,
    title: "Receive qualified leads",
    description: "Get detailed call summaries and customer information delivered straight to you.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Up and running in three simple steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-start">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
