import type { Metadata } from "next"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { AuthMethods } from "@/components/auth-methods"

export const metadata: Metadata = {
  title: "Sign in — Gigahoo",
  description: "Sign in to manage your AI receptionist.",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your AI receptionist.
            </p>
          </div>

          <div className="mt-6">
            <AuthMethods />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Start free
          </Link>
        </p>
      </div>
    </main>
  )
}
