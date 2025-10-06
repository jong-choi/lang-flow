import { describe, expect, it } from "vitest";
import type { FlowStateAnnotation } from "@/app/api/flow/_engine/graph-builder";
import { branchNode } from "@/app/api/flow/_engine/nodes/branch-node";

const createState = () =>
  ({
    messages: [],
    prompt: "",
    currentNodeId: "branch-1",
    searchResults: [],
    finalResult: null,
    nodeOutputs: {},
  }) as typeof FlowStateAnnotation.State;

describe("branchNode 노드", () => {
  it("타겟 노드가 있으면 nodeOutputs에 type=branch와 targetNodes가 기록된다", async () => {
    const state = createState();
    const nodeId = "branch-1";
    const targets = ["next-a", "next-b", "next-c"];

    const result = await branchNode(state, nodeId, targets);
    const output = result.nodeOutputs?.[nodeId];

    expect(output).toBeDefined();
    expect(output?.type).toBe("branch");
    expect(output?.targetNodes).toEqual(targets);
  });

  it("타겟 노드가 없으면 skipped=true와 reason이 기록된다", async () => {
    const state = createState();
    const nodeId = "branch-2";

    const result = await branchNode(state, nodeId, []);
    const output = result.nodeOutputs?.[nodeId];

    expect(output).toBeDefined();
    expect(output?.type).toBe("branch");
    expect(output?.skipped).toBe(true);
    expect(output?.reason).toBe("no targets");
  });
});
