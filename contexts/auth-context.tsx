"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  googleLogin,
  sendMagicLink as sendMagicLinkApi,
  verifyMagicLink as verifyMagicLinkApi,
  sendSmsCode as sendSmsCodeApi,
  verifySmsCode as verifySmsCodeApi,
  revokeToken,
  type AuthResponse,
} from "@/lib/api";

type AuthUser = {
  email?: string;
  displayName?: string;
};

type AuthState = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser | null;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (email: string, code: string) => Promise<AuthResponse>;
  sendSmsCode: (phoneNumber: string) => Promise<void>;
  verifySmsCode: (phoneNumber: string, code: string) => Promise<AuthResponse>;
  storeAuth: (response: AuthResponse, user?: AuthUser) => void;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
  waitForInit: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "gigahoo_auth";

function readStoredAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  document.cookie = "gigahoo_auth=1; path=/; max-age=2592000; SameSite=Lax";
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  document.cookie = "gigahoo_auth=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    if (stored) {
      const expiresMs = new Date(stored.expiresAt).getTime();
      if (expiresMs > Date.now() + 60_000) {
        setState(stored);
      }
    }
    setIsInitializing(false);
  }, []);

  const storeAuth = useCallback((response: AuthResponse, user?: AuthUser) => {
    const newState: AuthState = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
      user: user ?? null,
    };
    setState(newState);
    persistAuth(newState);
  }, []);

  const logout = useCallback(async () => {
    const stored = readStoredAuth();
    clearAuth();
    setState(null);
    if (stored?.refreshToken) {
      revokeToken(stored.refreshToken).catch(() => {});
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await googleLogin(idToken);
    storeAuth(response);
    return response;
  }, [storeAuth]);

  const sendMagicLink = useCallback(async (email: string) => {
    await sendMagicLinkApi(email);
  }, []);

  const verifyMagicLink = useCallback(async (email: string, code: string) => {
    const response = await verifyMagicLinkApi(email, code);
    storeAuth(response);
    return response;
  }, [storeAuth]);

  const sendSmsCode = useCallback(async (phoneNumber: string) => {
    await sendSmsCodeApi(phoneNumber);
  }, []);

  const verifySmsCode = useCallback(async (phoneNumber: string, code: string) => {
    const response = await verifySmsCodeApi(phoneNumber, code);
    storeAuth(response);
    return response;
  }, [storeAuth]);

  const isLoggedIn = useCallback(() => !!state, [state]);

  const waitForInit = useCallback(async () => {
    if (!isInitializing) return;
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!isInitializing) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }, [isInitializing]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!state,
        isInitializing,
        user: state?.user ?? null,
        loginWithGoogle,
        sendMagicLink,
        verifyMagicLink,
        sendSmsCode,
        verifySmsCode,
        storeAuth,
        logout,
        isLoggedIn,
        waitForInit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
