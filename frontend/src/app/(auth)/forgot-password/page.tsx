"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await authApi.forgotPassword(email);
      setSuccess(data.message || "Reset link sent successfully");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mt-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
            <Mail className="h-8 w-8 text-indigo-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            No worries. Enter your email address and we'll send you a secure
            password reset link.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-2 p-3 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email Address
            </label>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="
                  w-full rounded-xl
                  border border-white/10
                  bg-white/5
                  pl-12 pr-4 py-3.5
                  text-white
                  placeholder:text-zinc-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                  focus:border-transparent
                  transition-all
                "
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="
              group
              relative
              w-full
              overflow-hidden
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-purple-600
              py-3.5
              font-medium
              text-white
              transition-all
              hover:scale-[1.02]
              hover:shadow-xl
              hover:shadow-indigo-500/20
              active:scale-[0.99]
              disabled:opacity-50
              disabled:pointer-events-none
            "
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Sending..." : "Send Reset Link"}
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />

            <div>
              <p className="text-sm font-medium text-emerald-300">
                Secure Password Recovery
              </p>

              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Reset links expire automatically and can only be used once for
                enhanced account security.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthCard>
  );
}