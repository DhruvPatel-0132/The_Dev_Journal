import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroActions() {
  return (
    <div className="flex flex-wrap items-center gap-5 mt-10">
      <Link href="/featured">
        <button className="cursor-pointer h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 font-semibold flex items-center gap-3 shadow-[0_0_45px_rgba(99,102,241,0.45)] hover:scale-[1.03] transition-all duration-300">
          Discover Content
          <ArrowRight className="w-5 h-5" />
        </button>
      </Link>

      <Link href="/login">
        <button className="cursor-pointer h-14 px-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all duration-300">
          Start Writing
        </button>
      </Link>
    </div>
  );
}