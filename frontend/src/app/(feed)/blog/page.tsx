"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import Link from "next/link";
import { articleApi } from "@/lib/api";

const POSTS_PER_PAGE = 6;

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await articleApi.getAllArticles({
          page: currentPage,
          limit: POSTS_PER_PAGE,
          search: searchQuery || undefined,
        });
        setBlogs(res.articles || []);
        setTotalCount(res.pagination?.total || 0);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchBlogs();
    }, 300); // debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-white relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <BlogNavbar />

      <section className="relative z-10 min-h-screen pt-32 pb-20 px-5 sm:px-8 xl:px-10 max-w-[1440px] mx-auto w-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Articles</span>
            </h1>
            <p className="text-zinc-400 max-w-xl text-lg">
              Explore our collection of tutorials, insights, and thoughts on software engineering and design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-80 relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
            />
          </motion.div>
        </div>

        {/* Blog Grid */}
        {loading && blogs.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {blogs.length > 0 ? (
                blogs.map((blog, index) => (
                  <motion.div
                    key={blog._id || index}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative flex flex-col h-full bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {blog.publishedAt ? formatDate(blog.publishedAt) : "Draft"}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-300 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-zinc-400 text-sm flex-grow mb-6 line-clamp-3">
                      {blog.summary}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {blog.tags?.map((tag: string) => (
                        <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-zinc-300 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link href={`/blog/${blog.seoSlug}`} className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <p className="text-zinc-400 text-lg">No articles found matching "{searchQuery}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-4 mt-16"
          >
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-zinc-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </section>
    </main>
  );
}
