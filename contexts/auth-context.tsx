"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAccount, type AccountData, googleLogin, sendMagicLink as apiSendMagicLink, sendSmsCode as apiSendSmsCode, verifySmsCode as apiVerifySmsCode } from "@/lib/api";
import { sessionExpired, clearSession, touchActivity } from "@/lib/session";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: AccountData | null;
  logout: () => void;
  storeAuth: (response: { accessToken: string; expiresAt: string }, opts?: { navigate?: boolean }) => void;
  loginWithGoogle: (idToken: string, country?: string) => Promise<void>;
  sendMagicLink: (email: string, country?: string) => Promise<void>;
  sendSmsCode: (phoneNumber: string, country?: string) => Promise<void>;
  verifySmsCode: (phoneNumber: string, code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("gigahoo_token");
      if (token) {
        // A token's presence is NOT a session: the inactivity policy must hold across
        // tab closes and browser restarts (sessions used to survive for days because
        // this check didn't exist — only the in-tab idle timer did).
        if (sessionExpired()) {
          clearSession();
        } else {
          touchActivity(true); // opening the app is activity
          setIsAuthenticated(true);
          try {
            const accountData = await getAccount();
            setAccount(accountData);
          } catch {
            // Account exists but no business profile yet (just verified email)
            // Keep the token — don't clear it
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setAccount(null);
    clearSession();
    window.location.href = "/";
  };

  const storeAuth = async (response: { accessToken: string; expiresAt: string }, opts?: { navigate?: boolean }) => {
    localStorage.setItem("gigahoo_token", response.accessToken);
    localStorage.setItem("gigahoo_expires_at", response.expiresAt);
    touchActivity(true); // a fresh login starts the activity clock
    setIsAuthenticated(true);
    // navigate: false lets the CALLER own what happens next — the signup flow must stay
    // mounted through its embedded payment step (this auto-push once yanked a paid signup
    // to the dashboard mid-payment, so the card form never appeared).
    if (opts?.navigate === false) {
      getAccount().then(setAccount).catch(() => {});
      return;
    }
    // Go straight to the right page with client-side navigation (no full reload,
    // no flash of the /signup loader): dashboard if the account is already set up,
    // otherwise onboarding.
    try {
      const acc = await getAccount();
      setAccount(acc);
      router.push(acc.businessName?.trim() ? "/dashboard" : "/signup");
    } catch {
      router.push("/signup");
    }
  };

  const loginWithGoogle = async (idToken: string, country?: string) => {
    const response = await googleLogin(idToken, country);
    storeAuth(response);
  };

  const sendMagicLink = async (email: string, country?: string) => {
    await apiSendMagicLink(email, country);
  };

  const sendSmsCode = async (phoneNumber: string, country?: string) => {
    await apiSendSmsCode(phoneNumber, country);
  };

  const verifySmsCode = async (phoneNumber: string, code: string) => {
    const response = await apiVerifySmsCode(phoneNumber, code);
    storeAuth(response);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      account,
      logout,
      storeAuth,
      loginWithGoogle,
      sendMagicLink,
      sendSmsCode,
      verifySmsCode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
