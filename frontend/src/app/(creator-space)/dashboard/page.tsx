"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenSquare,
  FileText,
  Eye,
  Heart,
  TrendingUp,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trash2,
  Archive,
  X,
  TriangleAlert,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";

import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import { 
  useMyArticles, 
  useDashboardStats, 
  useDeleteArticle, 
  useArchiveArticle, 
  useUpdateArticle 
} from "@/hooks/useArticles";

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

type ModalAction = "delete" | "archive";

interface ModalState {
  open: boolean;
  action: ModalAction;
  article: Article | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({
  modal,
  loading,
  onConfirm,
  onClose,
}: {
  modal: ModalState;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isDelete = modal.action === "delete";

  return (
    <AnimatePresence>
      {modal.open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111113] backdrop-blur-xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    isDelete ? "bg-red-500/15" : "bg-amber-500/15"
                  }`}
                >
                  {isDelete ? (
                    <Trash2 size={20} className="text-red-400" />
                  ) : (
                    <Archive size={20} className="text-amber-400" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <h2 className="text-lg font-semibold mb-1">
                {isDelete ? "Delete this article?" : "Archive this article?"}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-1">
                <span className="text-white/70 font-medium">
                  &ldquo;{modal.article?.title}&rdquo;
                </span>
              </p>
              <p className="text-white/40 text-sm mt-2 leading-relaxed">
                {isDelete
                  ? "This action is permanent and cannot be undone. The article will be removed from the platform entirely."
                  : "Archived articles are hidden from the public feed but remain accessible to you for editing or restoration."}
              </p>

              {/* Warning banner for delete */}
              {isDelete && (
                <div className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <TriangleAlert size={14} className="text-red-400 shrink-0" />
                  <span className="text-red-300 text-xs">This cannot be undone.</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition text-sm font-medium text-white/70 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition text-sm font-medium disabled:opacity-60 ${
                    isDelete
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : isDelete ? (
                    <>
                      <Trash2 size={15} /> Delete
                    </>
                  ) : (
                    <>
                      <Archive size={15} /> Archive
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: statsRes, isLoading: statsLoading, isError: statsError, error: sError } = useDashboardStats();
  const stats = statsRes?.stats;

  const { data: articlesRes, isLoading: articlesLoading, isError: articlesError, error: aError } = useMyArticles({ limit: 5 });
  const articles: Article[] = articlesRes?.articles || [];

  const loading = statsLoading || articlesLoading;
  const error = (statsError ? (sError as any)?.message : null) || (articlesError ? (aError as any)?.message : null);

  const deleteMutation = useDeleteArticle();
  const archiveMutation = useArchiveArticle();
  const updateMutation = useUpdateArticle();

  const [modal, setModal] = useState<ModalState>({
    open: false,
    action: "delete",
    article: null,
  });
  const [actionError, setActionError] = useState("");
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  // ── Open modal ──────────────────────────────
  const openModal = (action: ModalAction, article: Article) => {
    setActionError("");
    setModal({ open: true, action, article });
  };

  const closeModal = () => {
    if (deleteMutation.isPending || archiveMutation.isPending) return;
    setModal((m) => ({ ...m, open: false }));
  };

  // ── Confirm action ──────────────────────────
  const handleConfirm = async () => {
    if (!modal.article) return;
    setActionError("");

    try {
      if (modal.action === "delete") {
        await deleteMutation.mutateAsync(modal.article.seoSlug);
      } else {
        await archiveMutation.mutateAsync(modal.article.seoSlug);
      }
      setModal((m) => ({ ...m, open: false }));
    } catch (err: any) {
      setActionError(err.message || "Something went wrong");
    }
  };

  // ── Toggle Status (published <-> draft) ─────
  const handleToggleStatus = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    setTogglingSlug(article.seoSlug);
    setActionError("");
    try {
      await updateMutation.mutateAsync({ slug: article.seoSlug, data: { status: newStatus } });
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle status");
    } finally {
      setTogglingSlug(null);
    }
  };

  const statCards = stats
    ? [
        { title: "Total Views", value: formatCount(stats.totalViews), icon: Eye },
        { title: "Total Likes", value: formatCount(stats.totalLikes), icon: Heart },
        { title: "Published", value: String(stats.publishedArticles), icon: FileText },
        { title: "Drafts", value: String(stats.draftArticles), icon: TrendingUp },
      ]
    : [];

  return (
    <>
      <ConfirmModal
        modal={modal}
        loading={deleteMutation.isPending || archiveMutation.isPending}
        onConfirm={handleConfirm}
        onClose={closeModal}
      />

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
              <p className="text-violet-400 font-medium mb-2">Creator Dashboard</p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Welcome Back 👋
              </h1>
              <p className="text-white/60 mt-4 max-w-2xl text-lg">
                Manage your content, track engagement, and grow your audience from one place.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/create-blog"
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
                >
                  <PenSquare size={18} />
                  Start Writing
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
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
              <button className="text-violet-400 hover:text-violet-300 transition text-sm">
                View All
              </button>
            </div>

            {/* Action error */}
            <AnimatePresence>
              {actionError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3"
                >
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{actionError}</p>
                </motion.div>
              )}
            </AnimatePresence>

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
                <h3 className="text-lg font-medium text-white/70 mb-2">No articles yet</h3>
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
                <AnimatePresence>
                  {articles.map((article, index) => (
                    <motion.div
                      key={article._id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-white/[0.02] transition-colors ${
                        index !== articles.length - 1 ? "border-b border-white/10" : ""
                      }`}
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate">{article.title}</h3>
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

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                            article.status === "published"
                              ? "bg-green-500/15 text-green-400"
                              : article.status === "draft"
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-gray-500/15 text-gray-400"
                          }`}
                        >
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </span>

                        {/* Status toggle (published <-> draft) */}
                        {article.status !== "archived" && (
                          <button
                            onClick={() => handleToggleStatus(article)}
                            disabled={togglingSlug === article.seoSlug}
                            title={article.status === 'published' ? 'Unpublish (revert to draft)' : 'Publish this article'}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition disabled:opacity-50 ${
                              article.status === 'published'
                                ? 'text-green-400/70 hover:text-yellow-400 hover:bg-yellow-500/10'
                                : 'text-yellow-400/70 hover:text-green-400 hover:bg-green-500/10'
                            }`}
                          >
                            {togglingSlug === article.seoSlug ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : article.status === 'published' ? (
                              <ToggleRight size={17} />
                            ) : (
                              <ToggleLeft size={17} />
                            )}
                          </button>
                        )}

                        {/* Edit */}
                        <Link
                          href={`/edit-blog/${article.seoSlug}`}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5"
                        >
                          <PenSquare size={13} /> Edit
                        </Link>

                        {/* Archive — only if not already archived */}
                        {article.status !== "archived" && (
                          <button
                            onClick={() => openModal("archive", article)}
                            title="Archive article"
                            className="w-8 h-8 flex items-center justify-center rounded-full text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 transition"
                          >
                            <Archive size={15} />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => openModal("delete", article)}
                          title="Delete article"
                          className="w-8 h-8 flex items-center justify-center rounded-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}