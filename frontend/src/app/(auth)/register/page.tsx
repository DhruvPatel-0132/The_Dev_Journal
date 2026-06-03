"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("visitor");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.register({ name, email, password, role });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) return;
    setLoading(true);
    setError("");

    try {
      const data = await authApi.googleAuth(response.credential);
      if (data.existingUser) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        router.push(data.redirect || "/");
      } else {
        // New user, store temp data and go to select-role
        sessionStorage.setItem("googleCredential", response.credential);
        sessionStorage.setItem("googleUser", JSON.stringify(data.user));
        router.push("/select-role");
      }
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
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
            Create your account
          </h1>

          <p className="text-sm text-zinc-500">
            Start publishing your engineering ideas in minutes
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="space-y-3">
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 
                focus:border-indigo-500 focus:bg-white/10 outline-none transition text-sm"
              />
            </div>

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

            {/* Role */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Choose your role</p>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">

                {/* Visitor */}
                <button
                  type="button"
                  onClick={() => setRole("visitor")}
                  className={`py-2 rounded-lg text-sm transition font-medium
                    ${role === "visitor"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Visitor
                  <p className="text-[10px] opacity-70 font-normal">
                    Read blogs
                  </p>
                </button>

                {/* Creator */}
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`py-2 rounded-lg text-sm transition font-medium
                    ${role === "creator"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  Creator
                  <p className="text-[10px] opacity-70 font-normal">
                    Write blogs
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Terms hint (product feel addition) */}
          {/* <p className="text-xs text-zinc-500 text-center leading-relaxed">
            By creating an account, you agree to our{" "}
            <span className="text-zinc-400 hover:text-zinc-300 cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-zinc-400 hover:text-zinc-300 cursor-pointer">
              Privacy Policy
            </span>
          </p> */}

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
            {loading ? "Creating your account..." : "Create account"}
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

        {/* Google */}
        <div className="flex justify-center w-full [&>div]:w-full [&>div>div]:w-full">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google Login Failed")}
            theme="filled_black"
            size="large"
            shape="rectangular"
            text="continue_with"
            width="100%"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthCard>
  );
}
