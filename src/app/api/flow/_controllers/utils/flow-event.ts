import type { StreamEvent } from "@langchain/core/tracers/log_stream";

type EmitEventParams = {
  controller: ReadableStreamDefaultController;
  nodeId: string;
  event: string;
  message?: string;
  data?: unknown;
  error?: string;
};

const encoder = new TextEncoder();

const emitEvent = (params: EmitEventParams) => {
  const { controller, ...eventData } = params;
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
};

export const flowEventHandler = ({
  controller,
  chunk,
}: {
  controller: ReadableStreamDefaultController;
  chunk: StreamEvent;
}) => {
  if (chunk.tags?.includes("langsmith:hidden")) return; // 랭스미스 디버깅 상태 제거
  const event = chunk.event;
  const nodeId = chunk.metadata.langgraph_node;

  if (event === "on_chain_start") {
    emitEvent({
      controller,
      nodeId: nodeId || "unknown",
      event: "node_start",
      message: `${nodeId} 시작`,
    });
  } else if (event === "on_chain_end") {
    if (chunk.data?.output?.nodeOutputs?.[nodeId]) {
      const nodeOutput = chunk.data.output.nodeOutputs[nodeId];
      const displayContent = nodeOutput.displayContent;

      if (displayContent && typeof displayContent === "string") {
        emitEvent({
          controller,
          nodeId: nodeId || "unknown",
          event: "node_streaming",
          data: { content: displayContent },
        });
      }
    }

    emitEvent({
      controller,
      nodeId: nodeId || "unknown",
      event: "node_complete",
      message: `${nodeId} 완료`,
      data: chunk.data.output,
    });
  } else if (event === "on_chat_model_start") {
    emitEvent({
      controller,
      nodeId: nodeId || "chatNode",
      event: "node_start",
      message: "채팅 모델 시작",
    });
  } else if (event === "on_chat_model_stream") {
    emitEvent({
      controller,
      nodeId: nodeId || "chatNode",
      event: "node_streaming",
      data: { content: chunk.data.chunk.content },
    });
  } else if (event === "on_chat_model_end") {
    emitEvent({
      controller,
      nodeId: nodeId || "chatNode",
      event: "node_complete",
      message: "채팅 모델 완료",
    });
  } else if (event === "on_tool_start") {
    emitEvent({
      controller,
      nodeId: nodeId || "toolNode",
      event: "node_start",
      message: "도구 실행 시작",
      data: chunk.data.input,
    });
  } else if (event === "on_tool_end") {
    emitEvent({
      controller,
      nodeId: nodeId || "toolNode",
      event: "node_complete",
      message: "도구 실행 완료",
      data: chunk.data.output,
    });
  } else if (event.includes("error")) {
    emitEvent({
      controller,
      nodeId: nodeId || "unknown",
      event: "node_error",
      error: "실행 중 오류가 발생했습니다",
    });
  }
};

export const emitFlowError = ({
  controller,
  error,
  nodeId = "flow",
}: {
  controller: ReadableStreamDefaultController;
  error: string;
  nodeId?: string;
}) => {
  emitEvent({
    controller,
    nodeId,
    event: "flow_error",
    error,
  });
};

export const emitFlowComplete = ({
  controller,
  sessionId,
}: {
  controller: ReadableStreamDefaultController;
  sessionId: string;
}) => {
  emitEvent({
    controller,
    nodeId: "flow",
    event: "flow_complete",
    message: "플로우 실행 완료",
    data: { sessionId },
  });
};
