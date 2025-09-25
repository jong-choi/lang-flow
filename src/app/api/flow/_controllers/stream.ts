import { type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  emitFlowComplete,
  emitFlowError,
  flowEventHandler,
} from "@/app/api/flow/_controllers/utils/flow-event";
import { buildGraphFromFlow } from "@/app/api/flow/_engine/graph-builder";
import type { FlowExecutionRequest } from "@/features/flow/types/execution";

export async function handleFlowStream(request: NextRequest) {
  try {
    const body: FlowExecutionRequest = await request.json();
    const { prompt, nodes, edges } = body;

    // 세션 ID 생성
    const sessionId = randomUUID();

    // React Flow를 LangGraph로 변환
    const { graph: compiledGraph, typeMap } = buildGraphFromFlow(nodes, edges);

    // 스트리밍 응답 설정
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // 플로우 시작 이벤트 전송
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                nodeId: "flow",
                event: "flow_start",
                message: "플로우 실행 시작",
                nodeType: "flow",
                data: { sessionId },
              })}\n\n`,
            ),
          );

          // 이벤트 스트리밍
          for await (const chunk of compiledGraph.streamEvents(
            { prompt },
            {
              version: "v2",
              configurable: { thread_id: sessionId },
            },
          )) {
            flowEventHandler({ controller, chunk, typeMap });
          }

          // 플로우 완료 이벤트 전송
          emitFlowComplete({ controller, sessionId });
        } catch (error) {
          console.error("Flow execution error:", error);
          emitFlowError({
            controller,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Flow stream setup error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
