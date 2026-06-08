"use client";

import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export default function AuthInitializer() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
