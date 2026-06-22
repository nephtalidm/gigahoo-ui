"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function PreviewToggle() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const preview = localStorage.getItem("gigahoo_preview") === "true";
    setIsPreview(preview);
    // Also ensure cookie is in sync
    const cookiePreview = document.cookie.includes("gigahoo_preview=true");
    if (preview && !cookiePreview) {
      document.cookie = "gigahoo_preview=true; path=/; max-age=31536000";
    } else if (!preview && cookiePreview) {
      document.cookie = "gigahoo_preview=; path=/; max-age=0";
    }
  }, []);

  const togglePreview = () => {
    const newValue = !isPreview;
    setIsPreview(newValue);
    localStorage.setItem("gigahoo_preview", String(newValue));
    // Set cookie for middleware
    if (newValue) {
      document.cookie = "gigahoo_preview=true; path=/; max-age=31536000"; // 1 year
    } else {
      document.cookie = "gigahoo_preview=; path=/; max-age=0"; // Delete
    }
    // Reload the page to apply changes
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={togglePreview}
      className="fixed bottom-4 right-4 z-50 shadow-lg"
    >
      {isPreview ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          Exit Preview
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Preview Mode
        </>
      )}
    </Button>
  );
}
