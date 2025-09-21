import type { StreamEvent } from "@langchain/core/tracers/log_stream";

type EmitEventPrams = {
  controller: ReadableStreamDefaultController;
  name: string;
  event: string;
  message?: string;
  chunk?: Partial<StreamEvent["data"]["chunk"]>;
};
const encoder = new TextEncoder();

const emitEvent = (params: EmitEventPrams) => {
  const { controller, ...data } = params;
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
};

export const chatEventHander = ({
  controller,
  chunk,
}: {
  controller: ReadableStreamDefaultController;
  chunk: StreamEvent;
}) => {
  const event = chunk.event;
  if (chunk.metadata.langgraph_node === "chatNode") {
    if (event === "on_chat_model_start") {
      emitEvent({ controller, name: "chatNode", event });
    } else if (event === "on_chat_model_stream") {
      emitEvent({
        controller,
        name: "chatNode",
        event,
        chunk: { content: chunk.data.chunk.content },
      });
    } else if (event === "on_chat_model_end") {
      emitEvent({ controller, name: "chatNode", event });
    }
  }
  if (chunk.metadata.langgraph_node === "googleNode") {
    if (chunk.event === "on_chain_start") {
      emitEvent({
        controller,
        name: "googleNode",
        event: "status",
        message: "검색 중",
      });
    } else if (chunk.event === "on_chain_end") {
      emitEvent({
        controller,
        name: "googleNode",
        event: "status",
        message: "검색 완료",
      });
    }
  }
  if (chunk.metadata.langgraph_node === "blogSearchNode") {
    if (chunk.event === "on_chain_start") {
      emitEvent({
        controller,
        name: "blogSearchNode",
        event: "status",
        message: "블로그 검색 중",
      });
    } else if (chunk.event === "on_chain_end") {
      emitEvent({
        controller,
        name: "blogSearchNode",
        event: "status",
        message: "블로그 검색 완료",
      });
    }
  }
  if (chunk.metadata.langgraph_node === "fetchSummaryNode") {
    if (chunk.event === "on_chain_start") {
      emitEvent({
        controller,
        name: "fetchSummaryNode",
        event: "status",
        message: "게시글 요약",
      });
    }
  }
};

export const bipassEventHander = ({
  content,
  controller,
}: {
  controller: ReadableStreamDefaultController;
  content: string;
}) => {
  emitEvent({
    controller,
    name: "chatNode",
    event: "on_chat_model_start",
  });

  emitEvent({
    controller,
    name: "chatNode",
    event: "on_chat_model_stream",
    chunk: { content },
  });

  emitEvent({
    controller,
    name: "chatNode",
    event: "on_chat_model_end",
  });
};
