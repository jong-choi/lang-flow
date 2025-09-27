"use client";

import { useCallback, useMemo, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Background,
  ConnectionMode,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SectionBadge } from "@/app/_components/ui/section-badge";
import { SectionHeading } from "@/app/_components/ui/section-heading";
import type { SchemaNode } from "@/features/flow/types/graph";

const FlowDemoNode = ({ data }: NodeProps<SchemaNode>) => {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white/85 px-6 py-4 shadow-sm">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-inner">
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
  const isInView = useInView(containerRef, { amount: 0.25 });

  const nodes: Node[] = useMemo(
    () => [
      {
        id: "1",
        type: "demoNode",
        position: { x: 100, y: 100 },
        data: {
          label: "사용자 입력",
          emoji: "👤",
        },
      },
      {
        id: "2",
        type: "demoNode",
        position: { x: 300, y: 50 },
        data: {
          label: "검색",
          emoji: "🔍",
        },
      },
      {
        id: "3",
        type: "demoNode",
        position: { x: 300, y: 150 },
        data: {
          label: "프롬프트",
          emoji: "💭",
        },
      },
      {
        id: "4",
        type: "demoNode",
        position: { x: 500, y: 100 },
        data: {
          label: "AI 응답 생성",
          emoji: "🤖",
        },
      },
      {
        id: "5",
        type: "demoNode",
        position: { x: 700, y: 100 },
        data: {
          label: "최종 결과",
          emoji: "✨",
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
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
        animated: isInView,
      },
      {
        id: "e1-3",
        source: "1",
        target: "3",
        style: { stroke: "#06b6d4", strokeWidth: 2 },
        animated: isInView,
      },
      {
        id: "e2-4",
        source: "2",
        target: "4",
        style: { stroke: "#10b981", strokeWidth: 2 },
        animated: isInView,
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        style: { stroke: "#f59e0b", strokeWidth: 2 },
        animated: isInView,
      },
      {
        id: "e4-5",
        source: "4",
        target: "5",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        animated: isInView,
      },
    ],
    [isInView],
  );

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <section
      ref={containerRef}
      className="bg-gradient-to-b from-white to-slate-50 py-24"
    >
      <div className="container mx-auto px-4">
        <div className="mb-16 space-y-6 text-center">
          <SectionBadge className="mx-auto bg-violet-100/70 text-violet-700">
            시각적 워크플로우
          </SectionBadge>
          <SectionHeading
            title="드래그 앤 드롭으로 완성하는 AI 파이프라인"
            description="복잡한 AI 로직을 직관적인 노드 연결로 구현하세요. 드래그 앤 드롭만으로 강력한 AI 파이프라인을 구축할 수 있습니다."
          />
        </div>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg">
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
              className="!bg-slate-50"
            >
              <Background
                color="#e2e8f0"
                gap={24}
                size={1}
                className="opacity-40"
              />
            </ReactFlow>
          </div>

          <motion.div
            className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.6),_transparent_70%)]"
            animate={
              isInView
                ? { y: [0, -10, 0], rotate: [0, 180, 360] }
                : { y: 0, rotate: 0 }
            }
            transition={{
              duration: 6,
              repeat: isInView ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -right-4 -bottom-4 h-6 w-6 rounded-full bg-[radial-gradient(circle_at_center,_rgba(52,211,153,0.6),_transparent_70%)]"
            animate={
              isInView
                ? { y: [0, 12, 0], rotate: [360, 180, 0] }
                : { y: 0, rotate: 0 }
            }
            transition={{
              duration: 7,
              repeat: isInView ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div className="rounded-xl border border-slate-200 bg-white/85 p-6 text-center shadow-sm">
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
          <div className="rounded-xl border border-slate-200 bg-white/85 p-6 text-center shadow-sm">
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
          <div className="rounded-xl border border-slate-200 bg-white/85 p-6 text-center shadow-sm">
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
