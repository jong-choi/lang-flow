import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HumanMessage } from "@langchain/core/messages";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { googleSearchNode } from "@/app/api/flow/_engine/nodes/google-search-node";

const createState = () =>
  ({
    messages: [] as HumanMessage[],
    prompt: "검색어",
    currentNodeId: "search-node-123",
    searchResults: [],
    finalResult: null,
    nodeOutputs: {},
  }) as typeof FlowStateAnnotation.State;

describe("googleSearchNode 노드", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            items: [
              {
                title: "결과",
                link: "https://example.com",
                snippet: "설명",
              },
            ],
          }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("현재 노드 ID를 사용해서 `nodeOutputs`에 검색 결과를 추가해야 합니다", async () => {
    const state = createState();

    const result = await googleSearchNode(state);
    const outputKeys = Object.keys(result.nodeOutputs ?? {});

    expect(outputKeys).toContain(state.currentNodeId);
  });
});
