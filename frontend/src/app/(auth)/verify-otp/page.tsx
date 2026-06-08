"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/lib/utils";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuthStore();

  // Resend state
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      triggerShake();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await authApi.verifyOTP(email, code);

      if (data.token) {
        login(data.user || null, data.token);
      }

      setSuccess(true);
      setTimeout(() => router.push(data.redirect || "/"), 2000);
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid OTP. Please try again.");
      triggerShake();
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendMessage("");

    try {
      await authApi.resendOTP(email);
      setResendMessage("A new code has been sent to your email.");
      setCooldown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setResendMessage(getErrorMessage(err) || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Back link */}
        <div className="flex justify-start">
          <Link href="/register" className="text-xs text-zinc-500 hover:text-zinc-300 transition">
            ← Back to register
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-zinc-400">
            Email Verification
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-green-400">
                  Email Verified!
                </h1>
                <p className="text-sm text-zinc-500">Redirecting...</p>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-1">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
                <p className="text-sm text-zinc-500">
                  We sent a 6-digit code to{" "}
                  <span className="text-zinc-300 font-medium">{email}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!success && (
          <>
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* OTP Input */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="flex justify-center gap-2 sm:gap-3"
                animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className={`w-11 h-13 sm:w-12 text-center text-xl font-semibold rounded-xl
                      bg-white/5 border outline-none transition-all duration-200
                      ${digit
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                        : "border-white/10 text-zinc-200"
                      }
                      focus:border-indigo-400 focus:bg-indigo-500/10
                      ${error ? "border-red-500/50" : ""}
                    `}
                    style={{ height: "3.25rem" }}
                  />
                ))}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600
                  hover:from-indigo-500 hover:to-purple-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </form>

            {/* Resend */}
            <div className="text-center space-y-2">
              {resendMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-400"
                >
                  {resendMessage}
                </motion.p>
              )}
              <p className="text-sm text-zinc-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {resending ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : null}
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AuthCard>
  );
}
