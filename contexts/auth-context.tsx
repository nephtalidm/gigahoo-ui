"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccount, type AccountData, googleLogin, sendMagicLink as apiSendMagicLink, sendSmsCode as apiSendSmsCode, verifySmsCode as apiVerifySmsCode } from "@/lib/api";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: AccountData | null;
  logout: () => void;
  storeAuth: (response: { accessToken: string; expiresAt: string }) => void;
  loginWithGoogle: (idToken: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  sendSmsCode: (phoneNumber: string) => Promise<void>;
  verifySmsCode: (phoneNumber: string, code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("gigahoo_token");
      if (token) {
        setIsAuthenticated(true);
        try {
          const accountData = await getAccount();
          setAccount(accountData);
        } catch {
          // Account exists but no business profile yet (just verified email)
          // Keep the token — don't clear it
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setAccount(null);
    localStorage.removeItem("gigahoo_token");
    localStorage.removeItem("gigahoo_expires_at");
    window.location.href = "/";
  };

  const storeAuth = (response: { accessToken: string; expiresAt: string }) => {
    localStorage.setItem("gigahoo_token", response.accessToken);
    localStorage.setItem("gigahoo_expires_at", response.expiresAt);
    setIsAuthenticated(true);
    window.location.href = "/signup";
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await googleLogin(idToken);
    storeAuth(response);
  };

  const sendMagicLink = async (email: string) => {
    await apiSendMagicLink(email);
  };

  const sendSmsCode = async (phoneNumber: string) => {
    await apiSendSmsCode(phoneNumber);
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
