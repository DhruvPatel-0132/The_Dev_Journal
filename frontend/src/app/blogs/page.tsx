"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

// Mock Data
const MOCK_BLOGS = [
  { id: 1, title: "Building Scalable Systems with Node.js", description: "Learn the core concepts of designing distributed systems and microservices using Node.js.", date: "Jun 02, 2026", tags: ["Node.js", "Backend", "Architecture"] },
  { id: 2, title: "Mastering Framer Motion in Next.js", description: "A comprehensive guide to creating stunning animations and interactions in your React applications.", date: "May 28, 2026", tags: ["React", "Animation", "Frontend"] },
  { id: 3, title: "The Future of AI in Software Engineering", description: "Exploring how LLMs and agentic AI are reshaping the way we write and maintain code.", date: "May 24, 2026", tags: ["AI", "Future", "Engineering"] },
  { id: 4, title: "Optimizing Web Vitals for E-commerce", description: "Practical tips and strategies to improve LCP, FID, and CLS scores for better user experiences.", date: "May 15, 2026", tags: ["Performance", "Web", "SEO"] },
  { id: 5, title: "Understanding React Server Components", description: "Dive deep into RSCs and discover how they change the paradigm of fetching data in React.", date: "May 10, 2026", tags: ["React", "Next.js", "Fullstack"] },
  { id: 6, title: "Deploying Kubernetes on Bare Metal", description: "Step-by-step tutorial on setting up a highly available K8s cluster from scratch.", date: "May 01, 2026", tags: ["DevOps", "Kubernetes", "Infrastructure"] },
  { id: 7, title: "Advanced TypeScript Patterns", description: "Elevate your TS skills by mastering mapped types, conditional types, and utility types.", date: "Apr 25, 2026", tags: ["TypeScript", "Advanced", "Types"] },
  { id: 8, title: "Designing Beautiful UIs with TailwindCSS", description: "How to leverage utility classes to build consistent and responsive user interfaces quickly.", date: "Apr 20, 2026", tags: ["CSS", "Design", "Tailwind"] },
];

const POSTS_PER_PAGE = 6;

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBlogs = useMemo(() => {
    return MOCK_BLOGS.filter(blog => {
      const query = searchQuery.toLowerCase();
      return (
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query) ||
        blog.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-white relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <Navbar />

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
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {paginatedBlogs.length > 0 ? (
              paginatedBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative flex flex-col h-full bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Calendar className="w-3.5 h-3.5" />
                    {blog.date}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-indigo-300 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-zinc-400 text-sm flex-grow mb-6 line-clamp-3">
                    {blog.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {blog.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-zinc-300 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link href={`#`} className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
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
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-zinc-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
