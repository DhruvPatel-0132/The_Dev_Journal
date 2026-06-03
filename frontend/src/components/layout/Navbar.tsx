"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
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
          <Link href="/blogs">
            <button className="cursor-pointer h-10 sm:h-11 px-4 sm:px-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-sm hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all duration-300">
              Explore
            </button>
          </Link>

          <Link href="/login">
            <button className="cursor-pointer h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-semibold flex items-center gap-2 shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:scale-[1.02] transition-all duration-300">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}