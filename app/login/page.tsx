"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { AuthMethods } from "@/components/auth-methods"
import { useSearchParams } from "next/navigation"

function LoginFormInner() {
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const isSignUp = mode === "signup"

  return (
    <main className="flex min-h-dvh flex-col bg-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="flex justify-center">
          <BrandLogo />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Create your account" : "Welcome"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? "Start answering every call in minutes."
                : "Sign in or create your account to get started."}
            </p>
          </div>

          <div className="mt-6">
            <AuthMethods initialMode={isSignUp ? "signup" : "signin"} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              {"Already have an account? "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              {"Don't have an account? "}
              <Link href="/login?mode=signup" className="font-medium text-primary hover:underline">
                Start free
              </Link>
            </>
          )}
        </p>

        <p className="mt-3 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
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
