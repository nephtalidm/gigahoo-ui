"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/contexts/language-context";
import { verifyMagicLink } from "@/lib/api";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const params = useSearchParams();
  const { t } = useTranslation();
  const { storeAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = params.get("email");
    const code = params.get("code");

    if (!email || !code) {
      setError(t("auth.invalidVerificationLink"));
      return;
    }

    verifyMagicLink(email, code)
      .then((response) => {
        // storeAuth routes through /signup, which sends fully-onboarded
        // users on to the dashboard and shows setup for new accounts.
        storeAuth(response);
      })
      .catch(() => {
        setError(t("auth.linkInvalidOrExpired"));
      });
  }, [params, storeAuth, t]);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{t("auth.verificationFailed")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <a href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            {t("auth.backToSignIn")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">{t("auth.verifyingIdentity")}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">{t("auth.loading")}</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
