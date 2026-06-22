"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccount, type AccountData, googleLogin, sendMagicLink as apiSendMagicLink, sendSmsCode as apiSendSmsCode, verifySmsCode as apiVerifySmsCode } from "@/lib/api";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  account: AccountData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  storeAuth: (response: { accessToken: string; refreshToken: string; expiresAt: string }) => void;
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
      const isPreview = localStorage.getItem("gigahoo_preview") === "true";
      
      if (isPreview) {
        setIsAuthenticated(true);
        setIsLoading(false);
        // Load mock account data
        try {
          const mockAccount = await getAccount();
          setAccount(mockAccount);
        } catch (error) {
          console.error("Failed to load mock account:", error);
        }
        return;
      }

      const token = localStorage.getItem("gigahoo_token");
      if (token) {
        setIsAuthenticated(true);
        try {
          const accountData = await getAccount();
          setAccount(accountData);
        } catch (error) {
          console.error("Failed to load account:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("gigahoo_token");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // In preview mode, just set authenticated
    const isPreview = localStorage.getItem("gigahoo_preview") === "true";
    if (isPreview) {
      setIsAuthenticated(true);
      return;
    }

    // Real login logic would go here
    throw new Error("Login not implemented - use preview mode");
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setAccount(null);
    localStorage.removeItem("gigahoo_token");
  };

  const storeAuth = (response: { accessToken: string; refreshToken: string; expiresAt: string }) => {
    localStorage.setItem("gigahoo_token", response.accessToken);
    localStorage.setItem("gigahoo_refresh_token", response.refreshToken);
    localStorage.setItem("gigahoo_expires_at", response.expiresAt);
    setIsAuthenticated(true);
    // Load account data after storing auth
    getAccount()
      .then((accountData) => setAccount(accountData))
      .catch((error) => console.error("Failed to load account:", error));
  };

  const loginWithGoogle = async (idToken: string) => {
    const isPreview = localStorage.getItem("gigahoo_preview") === "true";
    if (isPreview) {
      setIsAuthenticated(true);
      return;
    }
    
    const response = await googleLogin(idToken);
    storeAuth(response);
  };

  const sendMagicLink = async (email: string) => {
    const isPreview = localStorage.getItem("gigahoo_preview") === "true";
    if (isPreview) {
      return;
    }
    
    await apiSendMagicLink(email);
  };

  const sendSmsCode = async (phoneNumber: string) => {
    const isPreview = localStorage.getItem("gigahoo_preview") === "true";
    if (isPreview) {
      return;
    }
    
    await apiSendSmsCode(phoneNumber);
  };

  const verifySmsCode = async (phoneNumber: string, code: string) => {
    const isPreview = localStorage.getItem("gigahoo_preview") === "true";
    if (isPreview) {
      setIsAuthenticated(true);
      return;
    }
    
    const response = await apiVerifySmsCode(phoneNumber, code);
    storeAuth(response);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      account, 
      login, 
      logout, 
      storeAuth,
      loginWithGoogle,
      sendMagicLink,
      sendSmsCode,
      verifySmsCode
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
