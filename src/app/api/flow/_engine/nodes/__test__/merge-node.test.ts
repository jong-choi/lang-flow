import { describe, expect, it } from "vitest";
import { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { mergeNode } from "@/app/api/flow/_engine/nodes/merge-node";
import type { NodeOutput } from "@/features/flow/types/execution";

const baseState = () =>
  ({
    messages: [],
    prompt: "",
    currentNodeId: "merge-1",
    searchResults: [],
    finalResult: null,
    nodeOutputs: {},
  }) as typeof FlowStateAnnotation.State;

describe("mergeNode 노드", () => {
  it("입력 노드들의 메시지 출력을 \n\n으로 병합한다", async () => {
    const state = baseState();
    // 선행 노드 출력 모의
    state.nodeOutputs = {
      a: {
        type: "message",
        rendered: "첫 번째 결과",
        timestamp: new Date().toISOString(),
      },
      b: {
        type: "message",
        rendered: "두 번째 결과",
        timestamp: new Date().toISOString(),
      },
    } as Record<string, NodeOutput>;

    const result = await mergeNode(state, "merge-x", ["a", "b"]);
    const out = result.nodeOutputs?.["merge-x"];

    expect(out).toBeDefined();
    expect(out?.type).toBe("merge");
    expect(out?.mergedContent).toBe("첫 번째 결과\n\n두 번째 결과");
    expect(out?.inputNodeIds).toEqual(["a", "b"]);
    expect(out?.inputOutputs).toEqual(["첫 번째 결과", "두 번째 결과"]);

    // 병합 결과가 messages에 HumanMessage로 추가됨
    const last = (result.messages ?? [])[(result.messages?.length || 1) - 1];
    expect(last).toBeInstanceOf(HumanMessage);
    expect(last.content).toBe("첫 번째 결과\n\n두 번째 결과");
  });

  it("입력이 비어있으면 안내 메시지와 에러 필드를 제공한다", async () => {
    const state = baseState();

    const result = await mergeNode(state, "merge-empty", []);
    const out = result.nodeOutputs?.["merge-empty"];

    expect(out?.type).toBe("merge");
    expect(out?.error).toBe("No input nodes connected");
    const last = result.messages?.[0];
    expect(last).toBeInstanceOf(HumanMessage);
    expect(last?.content).toBe("병합할 입력 노드가 연결되지 않았습니다.");
  });

  it("메시지/AI/입력 타입 외에는 JSON 문자열로 병합한다", async () => {
    const state = baseState();
    state.messages = [new HumanMessage("무시될 메시지")];
    state.nodeOutputs = {
      x: {
        type: "custom",
        value: 123,
        timestamp: new Date().toISOString(),
      } as NodeOutput,
    } as Record<string, NodeOutput>;

    const result = await mergeNode(state, "merge-json", ["x"]);
    const out = result.nodeOutputs?.["merge-json"];
    expect(out?.mergedContent).toBe(JSON.stringify(state.nodeOutputs.x));
  });
});
