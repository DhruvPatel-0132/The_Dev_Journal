"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, User } from "lucide-react";
import Logo from "./Logo";
import { authApi } from "@/lib/api";
import { useEffect, useState } from "react";

type UserType = {
  name: string;
  email: string;
  avatar: string;
  role?: string;
};

export default function BlogNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserType | null>(null);

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

  const isVisitor = user?.role?.toUpperCase() === "VISITOR";

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
          {/* Show Dashboard button only for non-visitors on Blog page */}
          {user && !isVisitor && pathname === "/blog" && (
            <Link href="/dashboard">
              <button className="cursor-pointer h-10 sm:h-11 px-4 sm:px-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-sm font-medium text-zinc-200 hover:bg-white/[0.06] transition-all duration-300">
                Dashboard
              </button>
            </Link>
          )}

          {/* Show Blog button on Dashboard pages */}
          {user && pathname.startsWith("/dashboard") && (
            <Link href="/blog">
              <button className="cursor-pointer h-10 sm:h-11 px-4 sm:px-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-sm font-medium text-zinc-200 hover:bg-white/[0.06] transition-all duration-300">
                Blog
              </button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-violet-500/40 px-4 py-2 rounded-xl backdrop-blur-xl transition-all duration-200 cursor-pointer"
                title="View your profile"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-violet-500/50 transition-all duration-200 group-hover:scale-110"
                    unoptimized={!user.avatar.includes("googleusercontent.com") && !user.avatar.includes("cloudinary.com")}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:border-violet-500/50 group-hover:scale-110 transition-all duration-200">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                )}

                <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-200">
                  {user.name}
                </span>
              </Link>

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