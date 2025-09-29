import { describe, expect, it } from "vitest";
// eslint-disable-next-line import/no-restricted-paths
import { buildGraphFromFlow } from "@/app/api/flow/_engine/graph-builder";
import type {
  FlowEdgeInsert,
  FlowNodeInsert,
  SchemaNode,
} from "@/features/flow/types/graph";
import type { WorkflowApiDetail } from "@/features/flow/types/workflow-api";
import {
  calculateTemplateInsertion,
  createRandomEdgeId,
  createRandomGroupId,
} from "@/features/flow/utils/canvas";
import {
  deserializeWorkflowDetail,
  mapRowToSchemaEdge,
  mapRowToSchemaNode,
  serializeEdgeForApi,
  serializeNodeForApi,
} from "@/features/flow/utils/workflow-transformers";

const createMismatchedNode = (): SchemaNode => ({
  id: "node-search",
  type: "searchNode",
  position: { x: 120, y: 45 },
  data: {
    label: "검색 노드",
    emoji: "",
    job: "채팅",
    nodeType: "searchNode",
    runStatus: "idle",
  },
});

// 데이터가 그대로 유지되는지 확인
describe("워크플로우 변환기", () => {
  it("serializeNodeForApi가 일치하지 않는 job 메타데이터를 그대로 유지해야 한다", () => {
    const node = createMismatchedNode();

    const payload = serializeNodeForApi(node);

    expect(payload.data).toMatchObject({ job: "채팅" });
    expect(payload.type).toBe("searchNode");
  });

  it("deserializeWorkflowDetail이 직렬화-역직렬화 후에도 이전 job 데이터를 보존해야 한다", () => {
    const node = createMismatchedNode();
    const serialized = serializeNodeForApi(node);

    const workflowDetail: WorkflowApiDetail = {
      id: "workflow-1",
      name: "검색 흐름",
      description: null,
      updatedAt: new Date(),
      isOwner: true,
      isLicensed: false,
      nodes: [
        {
          id: serialized.id,
          type: serialized.type,
          posX: serialized.posX,
          posY: serialized.posY,
          data: serialized.data as Record<string, string>,
        },
      ],
      edges: [],
    };

    const deserialized = deserializeWorkflowDetail(workflowDetail);

    expect(deserialized.nodes[0].type).toBe("searchNode");
    expect(deserialized.nodes[0].data.job).toBe("채팅");
  });

  it("mapRowToSchemaNode가 타입으로부터 추론하지 않고 저장된 job 값을 유지해야 한다", () => {
    const insertRow: FlowNodeInsert = {
      id: "node-db",
      workflowId: "workflow-1",
      type: "searchNode",
      posX: 10,
      posY: 20,
      data: {
        label: "검색",
        emoji: "",
        job: "채팅",
        nodeType: "searchNode",
      },
    };

    const schemaNode = mapRowToSchemaNode(insertRow);

    expect(schemaNode.type).toBe("searchNode");
    expect(schemaNode.data.job).toBe("채팅");
  });

  it("mapRowToSchemaNode가 data가 null일 때 빈 job으로 대체되어야 한다", () => {
    const insertRow: FlowNodeInsert = {
      id: "node-empty",
      workflowId: "workflow-2",
      type: "messageNode",
      posX: 0,
      posY: 0,
      data: null,
    };

    const schemaNode = mapRowToSchemaNode(insertRow);

    expect(schemaNode.data.job).toBe("");
    expect(schemaNode.data.label).toBe("");
  });

  it("serializeEdgeForApi와 mapRowToSchemaEdge가 노드 연결을 변경하지 않고 왕복되어야 한다", () => {
    const edgeInsert: FlowEdgeInsert = {
      id: "edge-1",
      workflowId: "workflow-1",
      sourceId: "node-a",
      targetId: "node-b",
      label: "흐름",
      sourceHandle: "right",
      targetHandle: "left",
      order: 2,
    };

    const schemaEdge = mapRowToSchemaEdge(edgeInsert);
    expect(schemaEdge.source).toBe("node-a");
    expect(schemaEdge.target).toBe("node-b");

    const serialized = serializeEdgeForApi(schemaEdge);
    expect(serialized.sourceId).toBe("node-a");
    expect(serialized.targetId).toBe("node-b");
    expect(serialized.label).toBe("흐름");
    expect(serialized.order).toBeNull();
  });

  it("deserializeWorkflowDetail이 혼합 노드 타입에 대해 노드별 메타데이터를 유지해야 한다", () => {
    const workflowDetail: WorkflowApiDetail = {
      id: "workflow-3",
      name: "복합 플로우",
      description: "",
      updatedAt: new Date(),
      isOwner: true,
      isLicensed: false,
      nodes: [
        {
          id: "input-1",
          type: "inputNode",
          posX: 0,
          posY: 0,
          data: { label: "시작", emoji: "", job: "시작" },
        },
        {
          id: "chat-1",
          type: "chatNode",
          posX: 150,
          posY: 0,
          data: {
            label: "채팅",
            emoji: "",
            job: "채팅",
            nodeType: "chatNode",
            model: "gpt-4",
          },
        },
        {
          id: "search-1",
          type: "searchNode",
          posX: 300,
          posY: 0,
          data: {
            label: "검색",
            emoji: "",
            job: "검색",
            nodeType: "searchNode",
          },
        },
      ],
      edges: [
        {
          id: "edge-1",
          sourceId: "input-1",
          targetId: "chat-1",
          sourceHandle: null,
          targetHandle: null,
          label: null,
          order: null,
        },
        {
          id: "edge-2",
          sourceId: "chat-1",
          targetId: "search-1",
          sourceHandle: "right",
          targetHandle: "left",
          label: "연결",
          order: 1,
        },
      ],
    };

    const detail = deserializeWorkflowDetail(workflowDetail);

    expect(detail.nodes.map((node) => node.data.job)).toEqual([
      "시작",
      "채팅",
      "검색",
    ]);
    expect(detail.nodes[1].data.model).toBe("gpt-4");
    expect(detail.edges[1].label).toBe("연결");
  });

  it("calculateTemplateInsertion이 워크플로우 상세 노드들의 job 메타데이터를 보존해야 한다", () => {
    const workflowDetail = deserializeWorkflowDetail({
      id: "workflow-4",
      name: "템플릿",
      description: null,
      updatedAt: new Date(),
      nodes: [
        {
          id: "input-id",
          type: "inputNode",
          posX: 0,
          posY: 0,
          data: {
            label: "입력",
            emoji: "",
            job: "입력",
            nodeType: "inputNode",
          },
        },
        {
          id: "search-id",
          type: "searchNode",
          posX: 200,
          posY: 50,
          data: {
            label: "검색",
            emoji: "",
            job: "검색",
            nodeType: "searchNode",
            runStatus: "idle",
          },
        },
        {
          id: "chat-id",
          type: "chatNode",
          posX: 400,
          posY: 50,
          data: {
            label: "채팅",
            emoji: "",
            job: "채팅",
            nodeType: "chatNode",
            model: "gpt-4o",
            runStatus: "idle",
          },
        },
      ],
      edges: [
        {
          id: "edge-input-search",
          sourceId: "input-id",
          targetId: "search-id",
          sourceHandle: "right",
          targetHandle: "left",
          label: null,
          order: null,
        },
        {
          id: "edge-search-chat",
          sourceId: "search-id",
          targetId: "chat-id",
          sourceHandle: "right",
          targetHandle: "left",
          label: "연결",
          order: 1,
        },
      ],
    });

    const generatorSequence = (() => {
      let counter = 0;
      return () => `generated-${++counter}`;
    })();

    const insertion = calculateTemplateInsertion(
      workflowDetail,
      { x: 100, y: 100 },
      {
        generateNodeId: generatorSequence,
        generateEdgeId: createRandomEdgeId,
        generateGroupId: createRandomGroupId,
      },
    );

    expect(insertion).not.toBeNull();
    const resolvedInsertion = insertion!;

    const searchNode = resolvedInsertion.nodesToAdd.find(
      (node) => node.type === "searchNode",
    );
    expect(searchNode).toBeDefined();
    expect(searchNode?.data.job).toBe("검색");
    expect(searchNode?.data.nodeType).toBe("searchNode");
  });

  it("buildGraphFromFlow가 템플릿 삽입에서 생성된 노드를 google_search로 분류해야 한다", () => {
    const workflowDetail = deserializeWorkflowDetail({
      id: "workflow-5",
      name: "검증 템플릿",
      description: null,
      updatedAt: new Date(),
      nodes: [
        {
          id: "input-id",
          type: "inputNode",
          posX: 0,
          posY: 0,
          data: {
            label: "입력",
            emoji: "",
            job: "입력",
            nodeType: "inputNode",
          },
        },
        {
          id: "search-id",
          type: "searchNode",
          posX: 180,
          posY: 60,
          data: {
            label: "검색",
            emoji: "",
            job: "검색",
            nodeType: "searchNode",
          },
        },
      ],
      edges: [
        {
          id: "edge-input-search",
          sourceId: "input-id",
          targetId: "search-id",
          sourceHandle: null,
          targetHandle: null,
          label: null,
          order: null,
        },
      ],
    });

    const generatorSequence = (() => {
      let counter = 0;
      return () => `node-${++counter}`;
    })();

    const insertion = calculateTemplateInsertion(
      workflowDetail,
      { x: 200, y: 200 },
      {
        generateNodeId: generatorSequence,
        generateEdgeId: createRandomEdgeId,
        generateGroupId: createRandomGroupId,
      },
    );

    expect(insertion).not.toBeNull();
    const resolvedInsertion = insertion!;

    const { typeMap } = buildGraphFromFlow(
      resolvedInsertion.nodesToAdd,
      resolvedInsertion.edgesToAdd,
    );

    const createdSearchNode = resolvedInsertion.nodesToAdd.find(
      (node) => node.type === "searchNode",
    );
    expect(createdSearchNode).toBeDefined();

    expect(createdSearchNode && typeMap[createdSearchNode.id]).toBe(
      "google_search",
    );
  });
});
