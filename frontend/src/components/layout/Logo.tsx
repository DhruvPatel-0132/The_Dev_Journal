import { Terminal } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.45)]">
        <Terminal className="w-5 h-5 text-white" />
      </div>

      <div>
        <h1 className="text-lg font-bold tracking-tight">
          The Dev Journal
        </h1>

        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-mono mt-0.5">
          Engineering Blog
        </p>
      </div>
    </div>
  );
}