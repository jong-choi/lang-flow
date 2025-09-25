"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-emerald-300/15 blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-white/80 px-4 py-2 text-sm font-medium text-violet-700 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            AI 워크플로우
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="flex flex-col bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-6xl leading-tight font-extrabold text-transparent">
              <span className="block md:text-6xl lg:text-7xl">LANG</span>
              <span className="-mt-7 block md:text-7xl lg:text-8xl">FLOW</span>
              <motion.span
                className="mx-auto h-8 w-8"
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Zap className="h-8 w-8 text-amber-500" />
              </motion.span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href={"/auth/signin"}>
              <Button
                size="lg"
                className="group transform rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl"
              >
                게스트로 시작하기
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center justify-center gap-8 text-slate-600 sm:flex-row"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="h-16 w-1 rounded-full bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
      </motion.div>
    </section>
  );
}
