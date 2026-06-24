import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { SignupFlow } from "@/components/signup-flow"

export const metadata: Metadata = {
  title: "Set up your account — Gigahoo",
  description: "Tell us about your business to set up your AI receptionist.",
}

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Suspense fallback={null}>
            <SignupFlow />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Already set up your account? "}
          <Link href="/dashboard" className="font-medium text-primary hover:underline">
            Go to dashboard
          </Link>
        </p>
      </div>
    </main>
  )
}
