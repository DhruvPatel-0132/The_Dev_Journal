"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  PenSquare,
  Eye,
  Heart,
  FileText,
  TrendingUp,
  ArrowRight,
  LogOut,
  ExternalLink,
  Loader2,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import { articleApi, authApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: "creator" | "visitor";
}

interface Stats {
  totalViews: number;
  totalLikes: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
}

interface Article {
  _id: string;
  title: string;
  seoSlug: string;
  status: "draft" | "published" | "archived";
  viewCount: number;
  likeCount: number;
  readTime: number;
  updatedAt: string;
  category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 overflow-hidden group"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color}`}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/50 text-xs font-medium uppercase tracking-widest">{label}</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5`}>
            <Icon size={15} className="text-white/60" />
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Article row ──────────────────────────────────────────────────────────────
function ArticleRow({ article, index }: { article: Article; index: number }) {
  const statusStyle = {
    published: "bg-emerald-500/15 text-emerald-400",
    draft: "bg-amber-500/15 text-amber-400",
    archived: "bg-zinc-500/15 text-zinc-400",
  }[article.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 hover:bg-white/[0.025] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <Link
          href={`/blog/${article.seoSlug}`}
          className="font-medium text-sm text-white/90 hover:text-white transition-colors line-clamp-1 group-hover:underline underline-offset-2"
        >
          {article.title}
        </Link>
        <div className="flex items-center gap-3 text-xs text-white/40 mt-1.5">
          <span className="flex items-center gap-1"><Eye size={11} />{formatCount(article.viewCount)}</span>
          <span className="flex items-center gap-1"><Heart size={11} />{formatCount(article.likeCount)}</span>
          <span className="flex items-center gap-1"><FileText size={11} />{article.readTime || 1}m</span>
          <span>{timeAgo(article.updatedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
          {article.status}
        </span>
        <Link
          href={`/edit-blog/${article.seoSlug}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition"
        >
          <PenSquare size={13} />
        </Link>
        <Link
          href={`/blog/${article.seoSlug}`}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition"
        >
          <ExternalLink size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Load user from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) { router.push("/login"); return; }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } catch {
      router.push("/login");
    }
  }, [router]);

  // ── Fetch creator data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "creator") { setLoading(false); return; }

    const load = async () => {
      try {
        const [statsRes, articlesRes] = await Promise.all([
          articleApi.getDashboardStats(),
          articleApi.getMyArticles({ limit: 6 }),
        ]);
        setStats(statsRes.stats);
        setArticles(articlesRes.articles);
      } catch (e) {
        console.error("Profile fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try { await authApi.logout(); } catch { /* silent */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const isCreator = user?.role === "creator";

  if (!user) return null; // wait for redirect

  const statCards = stats
    ? [
        { icon: Eye, label: "Total Views", value: formatCount(stats.totalViews), color: "bg-gradient-to-br from-sky-500/5 to-transparent", delay: 0 },
        { icon: Heart, label: "Total Likes", value: formatCount(stats.totalLikes), color: "bg-gradient-to-br from-rose-500/5 to-transparent", delay: 0.05 },
        { icon: FileText, label: "Published", value: String(stats.publishedArticles), color: "bg-gradient-to-br from-emerald-500/5 to-transparent", delay: 0.1 },
        { icon: TrendingUp, label: "Drafts", value: String(stats.draftArticles), color: "bg-gradient-to-br from-amber-500/5 to-transparent", delay: 0.15 },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <BlogNavbar />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-32 pb-20">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden mb-8"
        >
          {/* Subtle top glow strip */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-7">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={88}
                  height={88}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-violet-500/30"
                  unoptimized={
                    !user.avatar.includes("googleusercontent.com") &&
                    !user.avatar.includes("cloudinary.com")
                  }
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                  <User size={36} className="text-white/40" />
                </div>
              )}
              {/* Online dot */}
              {/* <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0A0A0B]" /> */}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    isCreator
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                      : "bg-sky-500/15 text-sky-300 border border-sky-500/20"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-white/50 mb-6">
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-white/30" />
                  {user.email}
                </span>
                <span className="hidden sm:block text-white/20">·</span>
                <span className="flex items-center gap-2">
                  <Shield size={14} className="text-white/30" />
                  Member of The Dev Journal
                </span>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                {isCreator && (
                  <>
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition text-sm font-medium shadow-lg shadow-violet-500/20"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      href="/create-blog"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition text-sm font-medium"
                    >
                      <PenSquare size={15} />
                      New Article
                    </Link>
                  </>
                )}
                {!isCreator && (
                  <Link
                    href="/blog"
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium shadow-lg shadow-indigo-500/20"
                  >
                    <BookOpen size={15} />
                    Browse Blog
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition text-sm font-medium disabled:opacity-60"
                >
                  {loggingOut ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Creator section ───────────────────────────────────────────── */}
        {isCreator && (
          <>
            {/* Stats grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-pulse"
                  >
                    <div className="h-3 w-16 bg-white/10 rounded mb-4" />
                    <div className="h-7 w-10 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>
            )}

            {/* Recent articles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <h2 className="font-semibold text-white/90 flex items-center gap-2">
                  <FileText size={16} className="text-violet-400" />
                  Recent Articles
                </h2>
                <Link
                  href="/dashboard"
                  className="text-xs text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-5 animate-pulse ${i !== 2 ? "border-b border-white/[0.06]" : ""}`}
                    >
                      <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-1/3 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText size={40} className="text-white/15 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No articles yet</p>
                  <Link
                    href="/create-blog"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition text-sm font-medium"
                  >
                    <PenSquare size={14} /> Write your first article
                  </Link>
                </div>
              ) : (
                <div>
                  {articles.map((a, i) => (
                    <div
                      key={a._id}
                      className={i !== articles.length - 1 ? "border-b border-white/[0.06]" : ""}
                    >
                      <ArticleRow article={a} index={i} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* ── Visitor section ───────────────────────────────────────────── */}
        {!isCreator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">You're a Visitor</h2>
            <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-6">
              Explore engineering blogs, discover new ideas, and stay up to date with the community.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium shadow-lg shadow-indigo-500/20"
            >
              <BookOpen size={15} /> Browse all articles <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
