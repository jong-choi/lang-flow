import { describe, expect, it } from "vitest";
import { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { inputNode } from "@/app/api/flow/_engine/nodes/input-node";
import { outputNode } from "@/app/api/flow/_engine/nodes/output-node";

describe("inputNode / outputNode", () => {
  it("inputNode는 프롬프트를 HumanMessage로 추가하고 nodeOutputs.input을 세팅한다", async () => {
    const state = {
      messages: [],
      prompt: "사용자 질문",
      currentNodeId: "input-1",
      searchResults: [],
      finalResult: null,
      nodeOutputs: {},
    } as typeof FlowStateAnnotation.State;

    const result = await inputNode(state);

    expect(result.messages?.[0]).toBeInstanceOf(HumanMessage);
    expect(String(result.messages?.[0].content)).toBe("사용자 질문");
    expect(result.nodeOutputs?.input?.prompt).toBe("사용자 질문");
  });

  it("outputNode는 현재 상태를 최종 결과로 래핑해 반환한다", async () => {
    const state = {
      messages: [new HumanMessage("최종 메시지")],
      prompt: "질문",
      currentNodeId: "output-1",
      searchResults: [{ a: 1 }],
      finalResult: null,
      nodeOutputs: { foo: { type: "x", timestamp: new Date().toISOString() } },
    } as typeof FlowStateAnnotation.State;

    const result = await outputNode(state);

    expect(result.finalResult).toBeDefined();

    // finalResult의 타입을 FlowState로 타입 캐스팅
    const finalResult = result.finalResult as typeof FlowStateAnnotation.State;
    expect(finalResult?.messages?.length).toBe(1);
    expect(finalResult?.searchResults?.length).toBe(1);
    expect(finalResult?.nodeOutputs?.foo).toBeDefined();
    expect(result.nodeOutputs?.output?.finalResult).toBeDefined();
  });
});
