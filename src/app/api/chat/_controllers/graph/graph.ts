import type { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
  messagesStateReducer,
} from "@langchain/langgraph";
import { chatNode } from "@/app/api/chat/_controllers/graph/chat-node";
import { googleNode } from "@/app/api/chat/_controllers/graph/google-node";
import { routingNode } from "@/app/api/chat/_controllers/graph/routing-node";
import {
  LangNodeName,
  type RouteType,
} from "@/app/api/chat/_controllers/types/chat";
import { fetchSummaryNode } from "./fetch-summary-node";

export const SessionMessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),
  routeType: Annotation<RouteType>({
    default: () => "chat",
    reducer: (_, update) => update,
  }),
  routingQuery: Annotation<string | string[] | null>({
    default: () => null,
    reducer: (_, update) => update,
  }),
  postId: Annotation<string | undefined>({
    default: () => undefined,
    reducer: (_, update) => update,
  }),
  postSummary: Annotation<{ id: string; summary: string } | null>({
    default: () => null,
    reducer: (_, update) => update,
  }),
});

export const checkpointer = new MemorySaver();

export function buildGraph() {
  return new StateGraph(SessionMessagesAnnotation)
    .addNode(LangNodeName.routing, routingNode, {
      ends: [
        LangNodeName.chat,
        LangNodeName.google,
        LangNodeName.summary,
        LangNodeName.blogSearch,
        END,
      ],
    })
    .addNode(LangNodeName.summary, fetchSummaryNode, {
      ends: [LangNodeName.routing],
    })
    .addNode(LangNodeName.chat, chatNode, {
      ends: [LangNodeName.routing],
    })
    .addNode(LangNodeName.google, googleNode, {
      ends: [LangNodeName.routing],
    })
    .addEdge(START, LangNodeName.routing)
    .compile({ checkpointer });
}
