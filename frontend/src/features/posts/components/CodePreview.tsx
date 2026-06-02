"use client";

import { Code2 } from "lucide-react";
import { motion } from "framer-motion";

function CodePreview() {
  return (
    <>
      {/* RIGHT SIDE (UNCHANGED COMPLETELY) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="relative flex justify-center"
      >
        <div className="relative w-full max-w-[560px] rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.45)]">
          <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            <span className="text-xs text-zinc-500 font-mono">article.tsx</span>
          </div>

          <div className="p-8 font-mono text-sm space-y-5">
            <div className="text-zinc-500">
              <span className="text-violet-400">const</span>{" "}
              <span className="text-indigo-300">article</span> = {"{"}
            </div>

            <div className="pl-6 text-zinc-300">
              topic:
              <span className="text-emerald-400">
                {'"Distributed Systems"'},
              </span>
            </div>

            <div className="pl-6 text-zinc-300">
              category:
              <span className="text-emerald-400">{'"Engineering"'},</span>
            </div>

            <div className="pl-6 text-zinc-300">
              tags:
              <span className="text-emerald-400">
                {'["Backend", "Cloud", "Scalability"]'}
              </span>
            </div>

            <div className="pl-6 text-zinc-300">
              published:
              <span className="text-emerald-400"> true</span>
            </div>

            <div className="text-zinc-500">{"}"}</div>

            <div className="pt-7 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-zinc-400">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Engineering Knowledge Network
              </div>

              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs uppercase tracking-widest">
                Live
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default CodePreview;
