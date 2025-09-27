"use client";

import { useMemo, useRef } from "react";
import { Brain, Code, Palette, Rocket, Users, Zap } from "lucide-react";
import { motion, useInView } from "motion/react";
import { FeatureCard } from "@/app/_components/ui/feature-card";
import { SectionBadge } from "@/app/_components/ui/section-badge";
import { SectionHeading } from "@/app/_components/ui/section-heading";

const features = [
  {
    icon: <Brain className="h-7 w-7" />,
    title: "AI 통합",
    description: "LangChain과 다양한 LLM을 손쉽게 연결하고 활용하세요",
    accent: "bg-gradient-to-r from-violet-500 to-purple-500",
    background: "bg-gradient-to-br from-violet-50/70 to-white",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "실시간 실행",
    description: "워크플로우를 즉시 실행하고 결과를 실시간으로 확인하세요",
    accent: "bg-gradient-to-r from-amber-500 to-orange-500",
    background: "bg-gradient-to-br from-amber-50/70 to-white",
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: "플로우 공유",
    description: "설계한 플로우를 커뮤니티와 공유하세요",
    accent: "bg-gradient-to-r from-blue-500 to-indigo-500",
    background: "bg-gradient-to-br from-blue-50/70 to-white",
  },
] as const;

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });

  const featureItems = useMemo(
    () =>
      features.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          accentGradient={feature.accent}
          backgroundGradient={feature.background}
        />
      )),
    [],
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/70 py-24"
    >
      <div className="absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute top-10 left-1/5 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.25),_transparent_65%)]" />
        <div className="absolute right-1/6 bottom-5 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.2),_transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 space-y-6 text-center">
          <SectionBadge
            icon={<Palette className="h-4 w-4" />}
            className="bg-slate-100/80 text-violet-700"
          >
            강력한 기능들
          </SectionBadge>
          <SectionHeading
            title="모든 것을 한 곳에서"
            description="AI 워크플로우 생성부터 배포까지, 개발자가 필요한 모든 도구를 제공합니다."
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureItems}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm"
        >
          <div className="flex items-center gap-2 text-left">
            <Rocket className="h-6 w-6 text-violet-600" />
            <div>
              <div className="text-2xl font-bold text-slate-800">5분</div>
              <div className="text-sm text-slate-500">빠른 시작</div>
            </div>
          </div>
          <div className="hidden h-12 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2 text-left">
            <Code className="h-6 w-6 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold text-slate-800">1+</div>
              <div className="text-sm text-slate-500">사전 구성 노드</div>
            </div>
          </div>
          <div className="hidden h-12 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2 text-left">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-slate-800">매일</div>
              <div className="text-sm text-slate-500">무료 크레딧</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
