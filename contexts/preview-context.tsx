"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PreviewContextType = {
  isPreview: boolean;
  togglePreview: () => void;
};

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [isPreview, setIsPreview] = useState(false);

  const togglePreview = () => setIsPreview(!isPreview);

  return (
    <PreviewContext.Provider value={{ isPreview, togglePreview }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
}
