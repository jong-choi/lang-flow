"use client";

import { useCallback, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Background,
  ConnectionMode,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { SchemaNode } from "@/features/flow/types/graph";

const FlowDemoNode = ({ data }: NodeProps<SchemaNode>) => {
  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br px-6 py-4 shadow-lg ${data.gradient} border-2 border-white/50 backdrop-blur-sm`}
    >
      {/* 엣지 연결용 핸들 */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-xl shadow-inner">
          {data.emoji}
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold text-gray-800">{data.label}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  demoNode: FlowDemoNode,
};

export function FlowDemoSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1]);

  const nodes: Node[] = useMemo(
    () => [
      {
        id: "1",
        type: "demoNode",
        position: { x: 100, y: 100 },
        data: {
          label: "사용자 입력",
          emoji: "👤",
          gradient: "from-violet-100 to-violet-200",
        },
      },
      {
        id: "2",
        type: "demoNode",
        position: { x: 300, y: 50 },
        data: {
          label: "검색",
          emoji: "🔍",
          gradient: "from-blue-100 to-blue-200",
        },
      },
      {
        id: "3",
        type: "demoNode",
        position: { x: 300, y: 150 },
        data: {
          label: "프롬프트",
          emoji: "💭",
          gradient: "from-emerald-100 to-emerald-200",
        },
      },
      {
        id: "4",
        type: "demoNode",
        position: { x: 500, y: 100 },
        data: {
          label: "AI 응답 생성",
          emoji: "🤖",
          gradient: "from-amber-100 to-amber-200",
        },
      },
      {
        id: "5",
        type: "demoNode",
        position: { x: 700, y: 100 },
        data: {
          label: "최종 결과",
          emoji: "✨",
          gradient: "from-rose-100 to-rose-200",
        },
      },
    ],
    [],
  );

  const edges: Edge[] = useMemo(
    () => [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        style: { stroke: "#8b5cf6", strokeWidth: 3 },
        animated: true,
      },
      {
        id: "e1-3",
        source: "1",
        target: "3",
        style: { stroke: "#06b6d4", strokeWidth: 3 },
        animated: true,
      },
      {
        id: "e2-4",
        source: "2",
        target: "4",
        style: { stroke: "#10b981", strokeWidth: 3 },
        animated: true,
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        style: { stroke: "#f59e0b", strokeWidth: 3 },
        animated: true,
      },
      {
        id: "e4-5",
        source: "4",
        target: "5",
        style: { stroke: "#ef4444", strokeWidth: 3 },
        animated: true,
      },
    ],
    [],
  );

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <section
      ref={containerRef}
      className="bg-gradient-to-b from-white to-slate-50 py-24"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            시각적 워크플로우
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
            복잡한 AI 로직을 직관적인 노드 연결로 구현하세요.
            <br />
            드래그 앤 드롭만으로 강력한 AI 파이프라인을 구축할 수 있습니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ scale }}
          className="relative"
        >
          <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-violet-200/50 bg-gradient-to-br from-slate-50 to-violet-50 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              panOnDrag={false}
              panOnScroll={false}
              preventScrolling={false}
              zoomActivationKeyCode={null}
              panActivationKeyCode={null}
              attributionPosition="bottom-left"
              className="!bg-transparent"
            >
              <Background
                color="#e2e8f0"
                gap={20}
                size={1}
                className="opacity-30"
              />
              <MiniMap
                className="!rounded-lg !border-violet-200 !bg-white/80 !shadow-lg !backdrop-blur-sm"
                nodeColor="#8b5cf6"
                maskColor="rgba(139, 92, 246, 0.1)"
              />
            </ReactFlow>
          </div>

          <motion.div
            className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 shadow-lg"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -right-4 -bottom-4 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg"
            animate={{
              y: [0, 10, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div className="rounded-xl border border-violet-200/50 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-xl font-bold text-white">
              1
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              노드 배치
            </h3>
            <p className="text-sm text-slate-600">
              다양한 AI 컴포넌트를 캔버스에 드래그하여 배치하세요
            </p>
          </div>
          <div className="rounded-xl border border-violet-200/50 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-xl font-bold text-white">
              2
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              연결 설정
            </h3>
            <p className="text-sm text-slate-600">
              노드들을 연결하여 데이터 플로우를 정의하세요
            </p>
          </div>
          <div className="rounded-xl border border-violet-200/50 bg-white/80 p-6 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xl font-bold text-white">
              3
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">
              실행 & 테스트
            </h3>
            <p className="text-sm text-slate-600">
              완성된 워크플로우를 실행하고 결과를 확인하세요
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
