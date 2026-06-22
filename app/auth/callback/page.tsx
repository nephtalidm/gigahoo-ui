"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { verifyMagicLink } from "@/lib/api";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { storeAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = params.get("email");
    const code = params.get("code");

    if (!email || !code) {
      setError("Invalid verification link.");
      return;
    }

    verifyMagicLink(email, code)
      .then((response) => {
        storeAuth(response);
        router.replace("/dashboard");
      })
      .catch(() => {
        setError("This verification link is invalid or has expired.");
      });
  }, [params, storeAuth, router]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Verification failed</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <a href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">Verifying your identity…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
