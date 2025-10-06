import { describe, expect, it } from "vitest";
import { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { messageNode } from "@/app/api/flow/_engine/nodes/message-node";

describe("messageNode 노드", () => {
  it("템플릿을 렌더링할 때 마지막 메시지가 존재하더라도 프롬프트를 사용해야 한다", async () => {
    const state = {
      messages: [
        new HumanMessage("중간 결과"),
        new HumanMessage("검색 결과 텍스트"),
      ],
      prompt: "사용자 입력 프롬프트",
      currentNodeId: "message-node-1",
      searchResults: [],
      finalResult: null,
      nodeOutputs: {},
    } as typeof FlowStateAnnotation.State;

    const result = await messageNode(state, "message-node-1", "요약: {input}");
    const rendered = result.nodeOutputs?.["message-node-1"]?.rendered;

    expect(rendered).toBe("요약: 사용자 입력 프롬프트");
  });

  it("템플릿이 전달되지 않으면 기본 템플릿을 사용하고, 입력값이 없으면 빈 문자열로 대체되어야 한다", async () => {
    const state = {
      messages: [],
      prompt: "",
      currentNodeId: "message-node-2",
      searchResults: [],
      finalResult: null,
      nodeOutputs: {},
    } as typeof FlowStateAnnotation.State;

    const result = await messageNode(state, "message-node-2");
    const output = result.nodeOutputs?.["message-node-2"];

    expect(output).toBeDefined();
    expect(output?.template).toBe("기본 메시지: {input}");
    expect(output?.rendered).toBe("기본 메시지: ");
  });

  it("nodeOutputs에 input과 rendered 필드가 포함되어야 한다", async () => {
    const state = {
      messages: [new HumanMessage("안녕하세요")],
      prompt: "무시되는 프롬프트",
      currentNodeId: "message-node-3",
      searchResults: [],
      finalResult: null,
      nodeOutputs: {},
    } as typeof FlowStateAnnotation.State;

    const result = await messageNode(state, "message-node-3", "확인: {input}");
    const output = result.nodeOutputs?.["message-node-3"];

    expect(output?.input).toBe("안녕하세요");
    expect(output?.rendered).toBe("확인: 안녕하세요");
  });
});
