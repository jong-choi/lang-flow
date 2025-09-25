"use client";

import { Brain, Code, Palette, Rocket, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Brain,
    title: "AI 통합",
    description: "LangChain과 다양한 LLM을 손쉽게 연결하고 활용하세요",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
  },
  {
    icon: Zap,
    title: "실시간 실행",
    description: "워크플로우를 즉시 실행하고 결과를 실시간으로 확인하세요",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
  },
  {
    icon: Users,
    title: "플로우 공유",
    description: "설계한 플로우를 커뮤니티와 공유하세요",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient: "from-blue-50 to-indigo-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"
          animate={{
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 px-4 py-2 text-sm font-medium text-violet-700"
          >
            <Palette className="h-4 w-4" />
            강력한 기능들
          </motion.div>

          <h2 className="mb-6 bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            모든 것을 한 곳에서
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
            AI 워크플로우 생성부터 배포까지, 개발자가 필요한 모든 도구를
            제공합니다.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 },
              }}
              className={`group relative bg-gradient-to-br p-8 ${feature.bgGradient} overflow-hidden rounded-2xl border border-white/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />

              <div
                className={`relative h-16 w-16 bg-gradient-to-br ${feature.gradient} mb-6 flex items-center justify-center rounded-2xl shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>

              <div className="relative">
                <h3 className="mb-3 text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-slate-900">
                  {feature.title}
                </h3>
                <p className="mb-2 leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
                  {feature.description}
                </p>
              </div>
              <motion.div
                className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-8 rounded-2xl border border-violet-200/50 bg-gradient-to-r from-white to-violet-50 p-8 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-violet-600" />
              <div>
                <div className="text-2xl font-bold text-slate-800">5분</div>
                <div className="text-sm text-slate-600">빠른 시작</div>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-300 sm:block" />
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold text-slate-800">1+</div>
                <div className="text-sm text-slate-600">사전 구성 노드</div>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-300 sm:block" />
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-slate-800">매일</div>
                <div className="text-sm text-slate-600">무료 크레딧</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
