"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, Heart, Eye, ThumbsDown } from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import BlogNavbar from "@/components/layout/BlogNavbar";
import { articleApi } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface ArticleContentProps {
  article: any;
  slug: string;
}

export default function ArticleContent({ article, slug }: ArticleContentProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(article.likeCount || 0);
  const [dislikeCount, setDislikeCount] = useState(article.dislikeCount || 0);
  const [userAction, setUserAction] = useState<'liked' | 'disliked' | 'none'>(article.userAction || 'none');

  const handleLike = async () => {
    try {
      const prevAction = userAction;
      if (prevAction === 'liked') {
        setUserAction('none');
        setLikeCount((prev: number) => Math.max(0, prev - 1));
      } else {
        setUserAction('liked');
        setLikeCount((prev: number) => prev + 1);
        if (prevAction === 'disliked') setDislikeCount((prev: number) => Math.max(0, prev - 1));
      }
      
      const res = await articleApi.toggleLike(slug);
      setLikeCount(res.likeCount);
      setDislikeCount(res.dislikeCount);
      setUserAction(res.userAction);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDislike = async () => {
    try {
      const prevAction = userAction;
      if (prevAction === 'disliked') {
        setUserAction('none');
        setDislikeCount((prev: number) => Math.max(0, prev - 1));
      } else {
        setUserAction('disliked');
        setDislikeCount((prev: number) => prev + 1);
        if (prevAction === 'liked') setLikeCount((prev: number) => Math.max(0, prev - 1));
      }
      
      const res = await articleApi.toggleDislike(slug);
      setLikeCount(res.likeCount);
      setDislikeCount(res.dislikeCount);
      setUserAction(res.userAction);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white relative selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <BlogNavbar />

      <article className="relative z-10 pt-32 pb-24 px-5 sm:px-8 xl:px-10 max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </Link>
        </motion.div>

        {/* Header */}
        <header className="mb-14 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm text-zinc-400"
          >
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.publishedAt ? formatDate(article.publishedAt) : "Draft"}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight"
          >
            {article.title}
          </motion.h1>

          {/* Author Info & Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-y border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                {article.author?.name?.[0] || 'A'}
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{article.author?.name}</p>
                <p className="text-sm text-zinc-400">{article.author?.role === 'creator' ? 'Author' : 'Author'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-zinc-400">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm">{article.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart 
                  onClick={handleLike}
                  className={`w-5 h-5 cursor-pointer transition-colors ${userAction === 'liked' ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'}`} 
                />
                <span className="text-sm">{likeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown 
                  onClick={handleDislike}
                  className={`w-5 h-5 cursor-pointer transition-colors ${userAction === 'disliked' ? 'text-indigo-400 fill-indigo-400' : 'hover:text-indigo-400'}`} 
                />
                <span className="text-sm">{dislikeCount}</span>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <Share2 className="w-5 h-5 group-hover:text-white" />
              </button>
            </div>
          </motion.div>
        </header>

        {/* Banner Image */}
        {article.bannerImage?.url && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative w-full aspect-[4/1] mb-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <Image 
              src={article.bannerImage.url} 
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert prose-indigo max-w-none prose-lg
            prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-indigo-400 hover:prose-a:text-indigo-300
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:text-zinc-300 prose-li:my-2
            prose-blockquote:border-indigo-500/50 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
            prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#111113] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-2"
          >
            {article.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-zinc-300 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </motion.div>
        )}
      </article>
    </main>
  );
}
