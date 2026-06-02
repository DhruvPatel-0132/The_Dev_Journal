"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070709] text-white relative overflow-hidden">

      {/* Ambient Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute top-[-180px] left-[-160px] w-[520px] h-[520px] bg-indigo-600/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-160px] w-[520px] h-[520px] bg-purple-600/20 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="
          relative w-full max-w-md
          rounded-2xl
          p-8
          bg-white/5
          backdrop-blur-2xl
          border border-white/10
          shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]
          overflow-hidden
        "
      >
        {/* Inner glow border */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />

        {/* Top highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
}