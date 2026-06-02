"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import HeroActions from "./HeroActions";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl mb-8">
        <Sparkles className="w-4 h-4 text-indigo-400" />

        <span className="text-xs uppercase tracking-[0.2em] text-zinc-300 font-mono">
          Engineering Knowledge Platform
        </span>
      </div>

      <h1 className="text-[48px] sm:text-[58px] xl:text-[72px] leading-[0.95] font-[700] tracking-[-0.05em] max-w-[720px]">
        The platform for{" "}
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          engineering
        </span>{" "}
        knowledge.
      </h1>

      <p className="mt-8 text-[17px] sm:text-[19px] leading-[2rem] text-zinc-400 max-w-[580px] font-serif">
        Discover high-quality technical content, share your expertise,
        and connect with engineers through system design, backend,
        cloud, AI, and software engineering knowledge.
      </p>

      <HeroActions />
      <HeroStats />
    </motion.div>
  );
}