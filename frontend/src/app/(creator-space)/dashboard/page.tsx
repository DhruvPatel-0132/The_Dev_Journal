"use client";

import { motion } from "framer-motion";
import {
  PenSquare,
  FileText,
  Eye,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";

const stats = [
  {
    title: "Total Views",
    value: "128.4K",
    icon: Eye,
  },
  {
    title: "Followers",
    value: "2,847",
    icon: Users,
  },
  {
    title: "Articles",
    value: "36",
    icon: FileText,
  }
];

const recentPosts = [
  {
    title: "Mastering Next.js 16",
    views: "12.4K",
    status: "Published",
  },
  {
    title: "React Server Components Deep Dive",
    views: "8.9K",
    status: "Published",
  },
  {
    title: "Building SaaS with AI Agents",
    views: "-",
    status: "Draft",
  },
];

export default function DashboardPage() {
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
              <button className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition">
                <PenSquare size={18} />
                Start Writing
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition"
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((item, index) => (
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
              "Create Article",
              "Continue Draft",
            ].map((action) => (
              <motion.div
                key={action}
                whileHover={{
                  scale: 1.02,
                }}
                className="group cursor-pointer rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{action}</span>

                  <ArrowRight className="group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
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

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {recentPosts.map((post, index) => (
              <div
                key={post.title}
                className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between ${
                  index !== recentPosts.length - 1
                    ? "border-b border-white/10"
                    : ""
                }`}
              >
                <div>
                  <h3 className="font-medium text-lg">{post.title}</h3>

                  <p className="text-sm text-white/50 mt-1">
                    {post.views} views
                  </p>
                </div>

                <span
                  className={`mt-3 md:mt-0 px-3 py-1 rounded-full text-sm ${
                    post.status === "Published"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}