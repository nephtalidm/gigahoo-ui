"use client"

import Link from "next/link"
import { Suspense } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { AuthMethods } from "@/components/auth-methods"
import { useTranslation } from "@/contexts/language-context"

function LoginFormInner() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-dvh flex-col bg-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="flex justify-center [&_img]:h-[5.4rem]">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("auth.signInTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.signInSubtitle")}
            </p>
          </div>

          <div className="mt-6">
            <AuthMethods />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.termsPrefix")}
          <Link href="/terms" className="text-primary hover:underline">
            {t("auth.terms")}
          </Link>
          {t("auth.and")}
          <Link href="/privacy" className="text-primary hover:underline">
            {t("auth.privacyPolicy")}
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center" />}>
      <LoginFormInner />
    </Suspense>
  )
}
