"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PenSquare,
  FileText,
  Eye,
  Heart,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import { articleApi } from "@/lib/api";

interface DashboardStats {
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
  summary: string;
  category: string;
  status: "draft" | "published" | "archived";
  viewCount: number;
  likeCount: number;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function formatCount(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, articlesRes] = await Promise.all([
          articleApi.getDashboardStats(),
          articleApi.getMyArticles({ limit: 5 }),
        ]);

        setStats(statsRes.stats);
        setArticles(articlesRes.articles);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = stats
    ? [
        { title: "Total Views", value: formatCount(stats.totalViews), icon: Eye },
        { title: "Total Likes", value: formatCount(stats.totalLikes), icon: Heart },
        { title: "Published", value: String(stats.publishedArticles), icon: FileText },
        { title: "Drafts", value: String(stats.draftArticles), icon: TrendingUp },
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10">
            <p className="text-violet-400 font-medium mb-2">
              Creator Dashboard
            </p>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome Back 👋
            </h1>

            <p className="text-white/60 mt-4 max-w-2xl text-lg">
              Manage your content, track engagement, and grow your audience
              from one place.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/create-blog"
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
              >
                <PenSquare size={18} />
                Start Writing
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition"
                />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6 flex items-center gap-4"
          >
            <AlertCircle className="text-red-400 shrink-0" size={22} />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-white/10 rounded" />
                    <div className="w-10 h-10 rounded-xl bg-white/10" />
                  </div>
                  <div className="h-8 w-16 bg-white/10 rounded mt-4" />
                </div>
              ))
            : statCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{item.title}</span>
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                      <item.icon size={18} className="text-violet-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mt-4">{item.value}</h2>
                </motion.div>
              ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Create Article", href: "/create-blog" },
              { label: "Continue Draft", href: "/dashboard?filter=drafts" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{action.label}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Recent Articles</h2>

            <button className="text-violet-400 hover:text-violet-300 transition">
              View All
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-6 flex items-center justify-between animate-pulse ${
                    i !== 2 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 text-center"
            >
              <FileText size={48} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/70 mb-2">
                No articles yet
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Write your first article and it will show up here.
              </p>
              <Link
                href="/create-blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition text-sm font-medium"
              >
                <PenSquare size={16} />
                Create Your First Article
              </Link>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              {articles.map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-white/[0.02] transition-colors ${
                    index !== articles.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">
                      {article.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {formatCount(article.viewCount)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {formatCount(article.likeCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {article.readTime || 1} min read
                      </span>
                      <span>{timeAgo(article.updatedAt)}</span>
                    </div>
                  </div>

                  <span
                    className={`mt-3 md:mt-0 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      article.status === "published"
                        ? "bg-green-500/15 text-green-400"
                        : article.status === "draft"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-gray-500/15 text-gray-400"
                    }`}
                  >
                    {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}