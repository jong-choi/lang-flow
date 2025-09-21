import { NextRequest, NextResponse } from "next/server";
import { AIMessage } from "@langchain/core/messages";
import { buildGraph } from "@/app/api/chat/_controllers/graph/graph";
import {
  bipassEventHander,
  chatEventHander,
} from "@/app/api/chat/_controllers/utils/chat-event";
import { sessionStore } from "@/app/api/chat/_controllers/utils/session-store";

export async function handleStream(request: NextRequest, sessionId: string) {
  try {
    const session = sessionStore.get(sessionId);
    const inputs = session?.state;

    if (!inputs) {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const data = {
            event: "error",
            name: "chatNode",
            message: "전송할 메시지가 없음",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const app = buildGraph();

        // 구현되지 않은 기능들 바이패스
        if (
          inputs.routeType === "summary" ||
          inputs.routeType === "recommend"
        ) {
          try {
            const content = "아직 구현되지 않은 기능입니다.";

            bipassEventHander({
              controller,
              content,
            });

            await app.updateState(
              { configurable: { thread_id: sessionId } },
              { messages: [new AIMessage(content)], routeType: "" as const },
            );
          } catch {
            const data = { event: "error", message: "stream error" };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          } finally {
            controller.close();
          }
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        try {
          for await (const chunk of app.streamEvents(inputs, {
            version: "v2",
            configurable: { thread_id: sessionId },
            durability: "exit", // 랭그래프 종료 시점에만 상태 업데이트
          })) {
            chatEventHander({ controller, chunk });
          }
        } catch (error) {
          const data = { event: "error", message: "stream error" };
          console.error("Error on streaming", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
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
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to get stream" },
      { status: 500 },
    );
  }
}
