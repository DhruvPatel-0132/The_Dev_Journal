"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle, MailOpen } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setUnverified(false);

    try {
      const data = await authApi.loginRaw({ email, password, rememberMe });

      if (!data.ok) {
        if (data.status === 403 && data.unverified) {
          setUnverified(true);
          setError("Your email is not verified yet.");
        } else {
          setError(data.message || "Invalid credentials");
        }
        return;
      }

      if (data.token) {
        login(data.user || null, data.token);
        router.push(data.redirect || "/");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      if (!tokenResponse.access_token) return;
      setLoading(true);
      setError("");

      try {
        const data = await authApi.googleAuth(tokenResponse.access_token);
        if (data.existingUser) {
          login(data.user || null, data.token);
          router.push(data.redirect || "/");
        } else {
          // New user, store temp data and go to select-role
          sessionStorage.setItem("googleCredential", tokenResponse.access_token);
          sessionStorage.setItem("googleUser", JSON.stringify(data.user));
          router.push("/select-role");
        }
      } catch (err: any) {
        setError(err.message || "Google authentication failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  return (
    <AuthCard>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Back to Home */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Back to home
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-zinc-400">
            Engineering Blog Platform
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="text-sm text-zinc-500">
            Sign in to continue to your dashboard
          </p>
        </div>

        <AnimatePresence>
          {unverified ? (
            <motion.div
              key="unverified"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <MailOpen className="w-4 h-4 shrink-0" />
                <span>Your email is not verified yet.</span>
              </div>
              <Link
                href={`/verify-otp?email=${encodeURIComponent(email)}`}
                className="block w-full text-center py-2 rounded-lg text-xs font-medium
                  bg-amber-400/10 hover:bg-amber-400/20 text-amber-300
                  border border-amber-400/20 transition"
              >
                Verify your email →
              </Link>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="space-y-3">
            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 
                focus:border-indigo-500 focus:bg-white/10 outline-none transition text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 
                focus:border-indigo-500 focus:bg-white/10 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-indigo-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="hover:text-zinc-300 transition"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl 
            bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600
            hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
          >
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest">
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl 
          bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm font-medium"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Create account
          </Link>
        </p>
      </motion.div>
    </AuthCard>
  );
}
