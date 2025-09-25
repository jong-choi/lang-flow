"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function FooterCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-indigo-100 py-24">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-10 bottom-10 h-52 w-52 rounded-full bg-indigo-300/20 blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-emerald-300/15 blur-3xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 text-sm font-medium text-amber-700"
          >
            <Star className="h-4 w-4" />
            지금 시작하고 무료 크레딧을 받으세요
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8 bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-6xl lg:text-7xl"
          >
            오늘부터
            <br />
            시작하세요
            <span className="relative">
              <motion.div
                className="absolute -top-2 -right-2 h-6 w-6"
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-6 w-6 text-amber-500" />
              </motion.div>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <Link href={"/auth/signin"}>
              <Button
                size="lg"
                className="group transform rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-10 py-5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 hover:shadow-2xl"
              >
                게스트로 시작하기
                <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="absolute top-20 left-20 hidden lg:block"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="rounded-lg border border-violet-200/50 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-violet-600">1+</div>
            <div className="text-xs text-slate-600">워크플로우 생성됨</div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-20 bottom-20 hidden lg:block"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="rounded-lg border border-indigo-200/50 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
            <div className="text-xs text-slate-600">총 개발기간</div>
            <div className="text-xs font-semibold text-indigo-600">5일</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
