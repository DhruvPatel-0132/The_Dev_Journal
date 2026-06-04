"use client";

import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { verifyAndRefreshToken } from "@/lib/api";

export default function HeroActions() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const handleDiscoverContent = async () => {
    const token = await verifyAndRefreshToken();

    if (!token) {
      router.push("/login");
      return;
    }

    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Token decode error:", err);
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    const role = decoded?.role?.toLowerCase();
    if (role === "creator") {
      router.push("/dashboard");
    } else if (role === "visitor") {
      router.push("/blog");
    } else {
      router.push("/login");
    }
  };

  const handleStartWriting = async () => {
    const token = await verifyAndRefreshToken();
    let userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (userStr === "undefined" || userStr === "null") userStr = null;

    if (!token || !userStr) {
      // Not logged in → redirect to login
      router.push("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (err) {
      console.error("User parse error:", err);
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    if (user?.role?.toLowerCase() === "visitor") {
      // Visitor role → show toast, block navigation
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      return;
    }

    // Creator or other allowed role
    router.push("/create-blog");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-5 mt-10">
        <button
          onClick={handleDiscoverContent}
          className="cursor-pointer h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold flex items-center gap-3 shadow-[0_0_45px_rgba(99,102,241,0.45)] hover:scale-[1.03] transition-all duration-300"
        >
          Discover Content
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartWriting}
          className="cursor-pointer h-14 px-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all duration-300"
        >
          Start Writing
        </button>
      </div>

      {/* Role-restricted toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="visitor-toast"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-amber-500/30 bg-[#1a1408]/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(245,158,11,0.18)] text-sm text-amber-300"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/25 shrink-0">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-amber-200 text-[13px]">Visitors can't create blogs</span>
              <span className="text-amber-400/70 text-[11px] mt-0.5">
                Register as a <strong className="text-amber-300">Creator</strong> to start writing.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}