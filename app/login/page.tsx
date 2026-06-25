"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { AuthMethods } from "@/components/auth-methods"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "@/contexts/language-context"

function LoginFormInner() {
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const mode = searchParams.get("mode")
  const isSignUp = mode === "signup"

  return (
    <main className="flex min-h-dvh flex-col bg-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="flex justify-center [&_img]:h-[5.4rem]">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? t("auth.createAccountTitle") : t("auth.welcomeTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp ? t("auth.signUpSubtitle") : t("auth.signInSubtitle")}
            </p>
          </div>

          <div className="mt-6">
            <AuthMethods initialMode={isSignUp ? "signup" : "signin"} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              {t("auth.alreadyHaveAccount")}
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("auth.signInLink")}
              </Link>
            </>
          ) : (
            <>
              {t("auth.noAccount")}
              <Link href="/login?mode=signup" className="font-medium text-primary hover:underline">
                {t("auth.startFree")}
              </Link>
            </>
          )}
        </p>

        <p className="mt-3 text-center text-sm text-muted-foreground">
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
