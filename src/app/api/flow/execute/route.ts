import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  buildGraphFromFlow,
  executeGraph,
} from "@/app/api/flow/_engine/graph-builder";
import type {
  FlowExecutionRequest,
  FlowExecutionResponse,
  StreamingEvent,
} from "@/types/flow";

export async function POST(request: NextRequest) {
  try {
    const body: FlowExecutionRequest = await request.json();
    const { prompt, nodes, edges } = body;

    // 세션 ID 생성
    const sessionId = randomUUID();

    // React Flow를 LangGraph로 변환
    const compiledGraph = buildGraphFromFlow(nodes, edges);

    // 스트리밍 응답 설정
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 시작 이벤트 전송
          const startEvent: StreamingEvent = {
            type: "node_start",
            nodeId: "flow",
            nodeName: "Flow Execution",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(startEvent)}\n\n`),
          );

          // 그래프 실행 및 이벤트 스트리밍
          for await (const event of executeGraph(
            compiledGraph,
            prompt,
            sessionId,
          )) {
            console.log("=== Graph event ===", JSON.stringify(event, null, 2));

            const streamEvent: StreamingEvent = {
              type: "node_complete",
              nodeId: event.currentNodeId || "unknown",
              nodeName: "Node",
              result: event,
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(streamEvent)}\n\n`),
            );
          }

          // 완료 이벤트 전송
          const completeEvent: StreamingEvent = {
            type: "flow_complete",
            result: { sessionId },
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`),
          );
        } catch (error) {
          console.error("Flow execution error:", error);
          const errorEvent: StreamingEvent = {
            type: "flow_error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Flow execution setup error:", error);
    const errorResponse: FlowExecutionResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      sessionId: randomUUID(), // 세션 아이디는 실제로 사용되지 않음
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
