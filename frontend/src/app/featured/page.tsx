"use client";

import Image from "next/image";
import {
    Flame,
    TrendingUp,
    Cpu,
    Shield,
    Cloud,
    Code2,
    Mail,
} from "lucide-react";
import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import Navbar from "@/components/layout/Navbar";

export default function FeaturedPage() {
    const trending = [
        {
            title: "Building Secure Authentication Systems",
            image:
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200",
            readTime: "8 min read",
        },
        {
            title: "Mastering Next.js 15",
            image:
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
            readTime: "6 min read",
        },
        {
            title: "System Design Roadmap",
            image:
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
            readTime: "10 min read",
        },
    ];

    const categories = [
        {
            name: "Web Development",
            icon: <Code2 size={26} />,
            count: "125 Articles",
        },
        {
            name: "Cloud Computing",
            icon: <Cloud size={26} />,
            count: "64 Articles",
        },
        {
            name: "Cyber Security",
            icon: <Shield size={26} />,
            count: "51 Articles",
        },
        {
            name: "Artificial Intelligence",
            icon: <Cpu size={26} />,
            count: "89 Articles",
        },
    ];

    return (
        <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-white relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <BackgroundGlow />
                <GridPattern />
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 pb-10">
                {/* HERO */}
                <section className="relative">
                    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-10 py-16 lg:py-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
                                    <Flame size={16} />
                                    Featured Story
                                </span>

                                <h1 className="mt-6 text-5xl lg:text-7xl font-black leading-tight">
                                    Building
                                    <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                                        {" "}
                                        Production Grade{" "}
                                    </span>
                                    Authentication
                                </h1>

                                <p className="mt-6 text-slate-400 text-lg max-w-xl">
                                    Learn JWT, OAuth, RBAC, MFA and session management
                                    used by modern SaaS applications.
                                </p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <button className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 font-semibold shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:scale-[1.02] transition-all duration-300">
                                        Read Article
                                    </button>

                                    <button className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-8 py-4 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all duration-300">
                                        Bookmark
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-20"></div>
                                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#131316]">
                                    <Image
                                        src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200"
                                        alt="featured"
                                        width={1200}
                                        height={700}
                                        className="h-[500px] w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRENDING */}
                <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-10 py-20">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="text-indigo-400" />
                        <h2 className="text-3xl font-bold">
                            Trending Articles
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trending.map((article, index) => (
                            <article
                                key={index}
                                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300"
                            >
                                <div className="overflow-hidden">
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        width={500}
                                        height={300}
                                        className="h-60 w-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-3">
                                        {article.title}
                                    </h3>

                                    <p className="text-slate-400">
                                        {article.readTime}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* EDITOR PICKS */}
                <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-10 pb-20">
                    <h2 className="text-3xl font-bold mb-8">
                        Editor's Picks
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300"
                            >
                                <div className="h-52 rounded-2xl bg-gradient-to-br from-indigo-600/50 to-violet-600/50 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 mix-blend-overlay"></div>
                                </div>

                                <h3 className="mt-5 text-2xl font-bold">
                                    Advanced React Architecture
                                </h3>

                                <p className="mt-3 text-slate-400">
                                    Explore scalable frontend architecture used in
                                    enterprise-level applications.
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CATEGORIES */}
                <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-10 pb-20">
                    <h2 className="text-3xl font-bold mb-8">
                        Explore Categories
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 hover:border-indigo-500/40 hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <div className="inline-flex rounded-xl bg-indigo-500/10 p-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                    {category.icon}
                                </div>

                                <h3 className="mt-5 text-xl font-bold">
                                    {category.name}
                                </h3>

                                <p className="mt-2 text-slate-400">
                                    {category.count}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* NEWSLETTER */}
                <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-10 pb-24">
                    <div className="relative rounded-[32px] border border-indigo-500/20 bg-white/[0.02] backdrop-blur-md p-12 text-center overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <Mail
                                className="mx-auto text-indigo-400"
                                size={50}
                            />

                            <h2 className="mt-5 text-4xl font-bold">
                                Stay Updated
                            </h2>

                            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                                Receive weekly engineering articles, system design
                                guides and development tips straight to your inbox.
                            </p>

                            <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="rounded-xl border border-white/10 bg-[#0A0A0B]/50 px-5 py-4 outline-none w-full focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                                />

                                <button className="whitespace-nowrap rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 font-semibold shadow-[0_0_35px_rgba(99,102,241,0.2)] hover:scale-[1.02] transition-all duration-300">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}