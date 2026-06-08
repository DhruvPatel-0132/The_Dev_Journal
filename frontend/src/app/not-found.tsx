"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

// ── Floating particle component ──────────────────────────────────────────────
function Particle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-violet-400/40"
      style={{ left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0.5],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

const PARTICLES = [
  { x: "10%", y: "20%" },
  { x: "85%", y: "15%" },
  { x: "25%", y: "70%" },
  { x: "70%", y: "65%" },
  { x: "50%", y: "85%" },
  { x: "90%", y: "50%" },
  { x: "5%",  y: "55%" },
  { x: "40%", y: "10%" },
];

// ── Glitching 404 digits ──────────────────────────────────────────────────────
function GlitchDigits() {
  return (
    <div className="relative select-none flex items-center justify-center">
      {/* Shadow / echo layers */}
      <span
        aria-hidden
        className="absolute text-[clamp(120px,22vw,220px)] font-black tracking-tighter text-violet-500/10 blur-sm translate-x-1 translate-y-1"
      >
        404
      </span>
      <span
        aria-hidden
        className="absolute text-[clamp(120px,22vw,220px)] font-black tracking-tighter text-indigo-400/15 -translate-x-1"
      >
        404
      </span>

      {/* Main number */}
      <motion.span
        className="relative text-[clamp(120px,22vw,220px)] font-black tracking-tighter bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent"
        animate={{ opacity: [1, 0.92, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        404
      </motion.span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden flex flex-col items-center justify-center px-6">

      {/* ── Background glows ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[130px]" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-[130px]" />
        {/* Center glow that pulses */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        </motion.div>
      </div>

      {/* ── Grid pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} delay={i * 0.4} x={p.x} y={p.y} />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium tracking-wide"
        >
          Page Not Found
        </motion.div>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <GlitchDigits />
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent mt-2 mb-8"
        />

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
        >
          Oops, this page got lost in the void
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/50 text-base leading-relaxed mb-10"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all duration-200 font-medium text-sm shadow-lg shadow-violet-500/20"
          >
            <Home size={16} />
            Back to Home
            <motion.span
              className="inline-block"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </Link>

          {/* <button
            onClick={() => window.history.back()}
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200 font-medium text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </button> */}
        </motion.div>

        {/* Hint */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 text-white/25 text-xs"
        >
          Lost? Try searching or browsing the{" "}
          <Link href="/featured" className="text-violet-400/70 hover:text-violet-400 transition-colors underline underline-offset-2">
            featured posts
          </Link>
          .
        </motion.p> */}
      </div>
    </main>
  );
}
