import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google-gauth";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { chatNode } from "@/app/api/flow/_engine/nodes/chat-node";
import { DEFAULT_CHAT_MODEL } from "@/features/flow/constants/chat-models";

// 모듈 모킹: ChatGoogle 인스턴스를 가짜로 바꾸고 호출 인자를 검사할 수 있게 함
const instanceInvoke = vi.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_messages: (HumanMessage | SystemMessage)[]) =>
    new AIMessage("모킹 응답"),
);

// ChatGoogle 모킹 타입 정의
interface MockedChatGoogle {
  invoke: typeof instanceInvoke;
}

interface MockedConstructor {
  new (config?: { model?: string }): MockedChatGoogle;
  mock: {
    calls: unknown[][];
  };
}

vi.mock("@langchain/google-gauth", () => {
  const ChatGoogle = vi.fn(() => ({
    invoke: instanceInvoke,
  })) as unknown as MockedConstructor;
  return { ChatGoogle };
});

const baseState = () =>
  ({
    messages: [],
    prompt: "",
    currentNodeId: "chat-1",
    searchResults: [],
    finalResult: null,
    nodeOutputs: {},
  }) as typeof FlowStateAnnotation.State;

describe("chatNode 노드", () => {
  beforeEach(() => {
    instanceInvoke.mockClear();
    const MockedChatGoogle = ChatGoogle as unknown as MockedConstructor;
    MockedChatGoogle.mock?.calls?.splice?.(0);
  });

  it("직전 메시지를 입력으로 받아 invoke에 전달한다", async () => {
    const state = baseState();
    state.messages = [new HumanMessage("직전 메시지")];

    const result = await chatNode(state, { nodeId: "chat-x" });

    // Chat 모델 생성과 호출 확인
    const MockedChatGoogle = ChatGoogle as unknown as MockedConstructor;
    expect(MockedChatGoogle.mock.calls.length).toBe(1);
    expect(instanceInvoke).toHaveBeenCalledTimes(1);
    const passed = instanceInvoke.mock.calls[0][0];
    expect(Array.isArray(passed)).toBe(true);
    // 첫 메시지는 시스템 프롬프트, 두 번째가 직전 메시지
    expect(passed[0]).toBeInstanceOf(SystemMessage);
    expect(passed[1]).toBeInstanceOf(HumanMessage);
    expect(String(passed[1].content)).toBe("직전 메시지");

    // nodeOutputs.chat에 응답 기록
    expect(result.nodeOutputs?.chat?.response).toBe("모킹 응답");
  });

  it("모델이 유효하지 않으면 기본 모델로 생성한다", async () => {
    const state = baseState();
    state.messages = [new HumanMessage("hi")];

    await chatNode(state, { nodeId: "chat-y", model: "invalid-model" });

    const MockedChatGoogle = ChatGoogle as unknown as MockedConstructor;
    const call = MockedChatGoogle.mock.calls[0][0] as { model: string };
    expect(call.model).toBe(DEFAULT_CHAT_MODEL);
  });

  it("입력 메시지가 없으면 프롬프트 또는 기본 인사를 사용한다", async () => {
    const state = baseState();
    state.prompt = "프롬프트 질문";

    await chatNode(state, { nodeId: "chat-z" });
    const passed = instanceInvoke.mock.calls[0][0];
    expect(String(passed[1].content)).toBe("프롬프트 질문");
  });
});
