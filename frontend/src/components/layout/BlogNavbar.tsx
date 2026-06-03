"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User } from "lucide-react";
import Logo from "./Logo";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";

export default function BlogNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string, avatar: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Failed to logout from backend", e);
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 xl:px-10 h-24 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/">
            <Logo />
          </Link>
        </motion.div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-200">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="cursor-pointer h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center gap-2 shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:scale-[1.02] transition-all duration-300">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
