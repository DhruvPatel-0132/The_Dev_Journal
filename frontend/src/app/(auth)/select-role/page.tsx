"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthCard from "../_components/AuthCard";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/lib/utils";

export default function SelectRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("visitor");
  const { login } = useAuthStore();
  const [googleData, setGoogleData] = useState<{
    credential: string;
    user: { name: string; email: string; avatar: string };
  } | null>(null);

  useEffect(() => {
    const cred = sessionStorage.getItem("googleCredential");
    const userStr = sessionStorage.getItem("googleUser");
    if (!cred || !userStr) {
      router.push("/login");
      return;
    }
    setGoogleData({ credential: cred, user: JSON.parse(userStr) });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleData) return;

    setLoading(true);
    setError("");

    try {
      const data = await authApi.completeGoogleAuth(googleData.credential, role);
        if (data.token) {
          login(data.user || null, data.token);
          // clear session storage
        sessionStorage.removeItem("googleCredential");
        sessionStorage.removeItem("googleUser");

        router.push(data.redirect || "/");
      }
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to complete authentication.");
    } finally {
      setLoading(false);
    }
  };

  if (!googleData) return null; // or a loading spinner

  return (
    <AuthCard>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex px-3 py-1 text-xs rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            Almost there!
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Choose your role
          </h1>

          <p className="text-sm text-zinc-500">
            How do you plan to use The Dev Journal?
          </p>
        </div>

        {/* User Info from Google */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Image
            src={googleData.user.avatar}
            alt={googleData.user.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border border-white/20 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-sm truncate">{googleData.user.name}</span>
            <span className="text-xs text-zinc-400 truncate">{googleData.user.email}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Role Selection Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* Visitor Option */}
            <div
              onClick={() => setRole("visitor")}
              className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-200 ${role === "visitor"
                  ? "bg-indigo-500/10 border-indigo-500/50"
                  : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
            >
              {role === "visitor" && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-indigo-400" />
              )}
              <h3 className={`font-medium ${role === "visitor" ? "text-indigo-400" : "text-white"}`}>Visitor</h3>
              <p className="text-xs text-zinc-500 mt-1 pr-6 leading-relaxed">
                Read engineering blogs, discover new ideas, and stay up to date with the community.
              </p>
            </div>

            {/* Creator Option */}
            <div
              onClick={() => setRole("creator")}
              className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-200 ${role === "creator"
                  ? "bg-purple-500/10 border-purple-500/50"
                  : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
            >
              {role === "creator" && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-purple-400" />
              )}
              <h3 className={`font-medium ${role === "creator" ? "text-purple-400" : "text-white"}`}>Creator</h3>
              <p className="text-xs text-zinc-500 mt-1 pr-6 leading-relaxed">
                Publish your own blogs, share your knowledge, and build your audience.
              </p>
            </div>
          </div>

          {/* Primary Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl 
            disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm
            ${role === "creator"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              }
            `}
          >
            {loading ? "Creating your account..." : "Complete Setup"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>
      </motion.div>
    </AuthCard>
  );
}
