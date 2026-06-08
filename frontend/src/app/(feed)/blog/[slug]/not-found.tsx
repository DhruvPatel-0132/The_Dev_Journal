import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";

export default function ArticleNotFound() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center relative">
      <BackgroundGlow />
      <div className="relative z-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-zinc-400 mb-8">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/blog"
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>
      </div>
    </main>
  );
}
