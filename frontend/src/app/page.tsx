"use client";

import BackgroundGlow from "@/components/common/BackgroundGlow";
import GridPattern from "@/components/common/GridPattern";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import CodePreview from "@/components/home/CodePreview";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-white relative">
      <div className="absolute inset-0 overflow-hidden">
        <BackgroundGlow />
        <GridPattern />
      </div>

      <Navbar />

      <section className="relative z-10 min-h-screen flex items-center pt-28 pb-10">
        <div className="max-w-[1440px] mx-auto w-full px-5 sm:px-8 xl:px-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">
          <Hero />
          <CodePreview />
        </div>
      </section>
    </main>
  );
}