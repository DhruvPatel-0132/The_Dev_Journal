"use client";

import { useEffect } from "react";
import { useAuthStore } from "./authStore";
import { verifyAndRefreshToken } from "@/lib/api";

export default function AuthInitializer() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
    
    // Check and refresh token on mount
    verifyAndRefreshToken();

    // Set up an interval to refresh the token every 14 minutes
    // Access token expires in 15 minutes
    const intervalId = setInterval(() => {
      verifyAndRefreshToken();
    }, 14 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [initAuth]);

  return null;
}
