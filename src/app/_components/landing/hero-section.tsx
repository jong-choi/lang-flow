"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion, useInView } from "motion/react";

import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/app/_components/ui/section-badge";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(196,181,253,0.28),_transparent_65%)]" />
        <div className="absolute bottom-12 right-12 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_rgba(165,180,252,0.24),_transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(110,231,183,0.18),_transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="space-y-10 text-center">
          <SectionBadge
            icon={<Sparkles className="h-4 w-4 text-violet-600" />}
            className="mx-auto border-violet-200/80 bg-white/80 text-violet-700"
          >
            AI 워크플로우
          </SectionBadge>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1 className="flex flex-col bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-6xl leading-tight font-extrabold text-transparent md:text-7xl lg:text-8xl">
              <span className="block">LANG</span>
              <span className="-mt-8 block">FLOW</span>
              <motion.span
                className="mx-auto h-10 w-10 text-amber-500"
                animate={isInView ? { rotate: [0, 15, -15, 0], scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 2.2, repeat: isInView ? Infinity : 0, ease: "easeInOut" }}
              >
                <Zap className="h-10 w-10" />
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-slate-700 md:text-2xl"
          >
            시각적인 인터페이스로 AI 워크플로우를 설계하고,
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text font-semibold text-transparent">
              LangChain
            </span>
            의 강력함을 직관적으로 경험하세요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="group transform rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700"
              >
                게스트로 시작하기
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-8 text-slate-600"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-700">1+</div>
              <div className="text-sm font-medium">워크플로우 생성</div>
            </div>
            <div className="hidden h-8 w-px bg-slate-300 sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-700">1+</div>
              <div className="text-sm font-medium">활성 사용자</div>
            </div>
            <div className="hidden h-8 w-px bg-slate-300 sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-700">0</div>
              <div className="text-sm font-medium">누적매출</div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={isInView ? { y: [0, 12, 0] } : { y: 0 }}
        transition={{ duration: 2.4, repeat: isInView ? Infinity : 0, ease: "easeInOut" }}
      >
        <div className="h-16 w-1 rounded-full bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
      </motion.div>
    </section>
  );
}
