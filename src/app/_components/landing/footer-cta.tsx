"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion, useInView } from "motion/react";

import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/app/_components/ui/section-badge";

export function FooterCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-indigo-100 py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,_rgba(196,181,253,0.25),_transparent_65%)]" />
        <div className="absolute bottom-12 right-12 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(165,180,252,0.26),_transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(110,231,183,0.16),_transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <SectionBadge
            icon={<Star className="h-4 w-4 text-amber-600" />}
            className="mx-auto mb-8 bg-amber-100/80 text-amber-800"
          >
            지금 시작하고 무료 크레딧을 받으세요
          </SectionBadge>

          <motion.h2
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl"
          >
            오늘부터
            <br />
            시작하세요
            <motion.span
              className="relative inline-flex h-6 w-6 align-middle"
              animate={isInView ? { rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
              transition={{ duration: 2.2, repeat: isInView ? Infinity : 0, ease: "easeInOut" }}
            >
              <Sparkles className="pointer-events-none h-6 w-6 text-amber-500" />
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="mb-12 text-xl leading-relaxed font-medium text-slate-700 md:text-2xl"
          >
            몇 분 안에 첫 번째 AI 워크플로우를 만들어보세요.
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text font-semibold text-transparent">
              로그인 없이
            </span>
            , 즉시 시작 가능합니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="group transform rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-10 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700"
              >
                게스트로 시작하기
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="absolute left-20 top-20 hidden rounded-lg border border-violet-200/70 bg-white/85 px-4 py-2 text-left shadow-sm lg:block"
          animate={isInView ? { y: [0, -12, 0], rotate: [0, 6, 0] } : { y: 0, rotate: 0 }}
          transition={{ duration: 4.5, repeat: isInView ? Infinity : 0, ease: "easeInOut" }}
        >
          <div className="text-xs font-semibold text-violet-600">1+</div>
          <div className="text-xs text-slate-600">워크플로우 생성됨</div>
        </motion.div>

        <motion.div
          className="absolute right-20 bottom-20 hidden rounded-lg border border-indigo-200/70 bg-white/85 px-4 py-2 text-right shadow-sm lg:block"
          animate={isInView ? { y: [0, 10, 0], rotate: [0, -6, 0] } : { y: 0, rotate: 0 }}
          transition={{ duration: 5, repeat: isInView ? Infinity : 0, ease: "easeInOut" }}
        >
          <div className="text-xs text-slate-600">총 개발기간</div>
          <div className="text-xs font-semibold text-indigo-600">5일</div>
        </motion.div>
      </div>
    </section>
  );
}
