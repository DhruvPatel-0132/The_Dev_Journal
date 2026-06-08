"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await authApi.resetPassword(token, password);
      setSuccess(data.message || "Password has been successfully reset");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      {/* Header */}
      <div className="mt-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10">
          <Lock className="h-8 w-8 text-indigo-400" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Reset Password
        </h1>

        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Please enter your new password below.
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
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            New Password
          </label>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition" />

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Confirm New Password
          </label>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition" />

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
          disabled={loading}
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
            {loading ? "Resetting..." : "Reset Password"}
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
              Secure Password Reset
            </p>

            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              Make sure your new password is at least 8 characters long and includes a mix of letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <Suspense fallback={<div className="text-center text-zinc-500">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
