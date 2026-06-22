import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "Does the AI sound natural?",
    a: "Yes. Our AI uses advanced voice technology to provide natural, human-like conversations.",
  },
  {
    q: "Can customers speak different languages?",
    a: "Yes. The AI can automatically communicate in multiple languages.",
  },
  {
    q: "Can I keep my existing phone number?",
    a: "Yes. Simply forward your existing business number.",
  },
  {
    q: "What happens if I exceed my included minutes?",
    a: "Additional minutes are billed separately.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are up and running within a day.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
          <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion className="mt-10 w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
