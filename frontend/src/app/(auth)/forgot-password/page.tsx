import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import AuthCard from "../_components/AuthCard";

export default function ForgotPasswordPage() {
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

        {/* Form */}
        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

              <input
                id="email"
                type="email"
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
            "
          >
            <span className="relative z-10">
              Send Reset Link
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5" />

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