import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWorkflow,
  listWorkflows,
} from "@/app/api/flow/workflows/_controllers/workflows";
import { flowNodeTypeEnum } from "@/features/flow/db/schema";

const nodeSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(flowNodeTypeEnum.enumValues),
  posX: z.number().optional(),
  posY: z.number().optional(),
  data: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.object({}).loose(),
      ]),
    )
    .optional()
    .nullable(),
});

const edgeSchema = z.object({
  id: z.string().min(1).optional(),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  sourceHandle: z.string().min(1).optional().nullable(),
  targetHandle: z.string().min(1).optional().nullable(),
  label: z.string().optional().nullable(),
  order: z.number().int().optional().nullable(),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  description: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
});

type WorkflowSummary = Awaited<ReturnType<typeof listWorkflows>>[number];
type WorkflowDetail = Awaited<ReturnType<typeof createWorkflow>>;

type CreateWorkflowPayload = z.infer<typeof createWorkflowSchema>;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get("ownerId");
    const ownerId = ownerIdParam ? ownerIdParam : undefined;

    const workflows = await listWorkflows({ ownerId });
    const payload: WorkflowSummary[] = workflows;

    return NextResponse.json({ workflows: payload });
  } catch (error) {
    console.error("워크플로우 목록 조회 실패", error);
    return NextResponse.json(
      { message: "워크플로우 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = createWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const data: CreateWorkflowPayload = parsed.data;
    const workflow = await createWorkflow({
      ...data,
      description: data.description ?? null,
      ownerId: data.ownerId ?? null,
      nodes: data.nodes,
      edges: data.edges,
    });

    const payload: WorkflowDetail = workflow;

    return NextResponse.json({ workflow: payload }, { status: 201 });
  } catch (error) {
    console.error("워크플로우 생성 실패", error);
    return NextResponse.json(
      { message: "워크플로우를 생성하지 못했습니다." },
      { status: 500 },
    );
  }
}
