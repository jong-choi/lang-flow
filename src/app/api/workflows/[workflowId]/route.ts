import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteWorkflow,
  getWorkflowById,
  updateWorkflow,
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

const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
});

type WorkflowDetail = Exclude<
  Awaited<ReturnType<typeof getWorkflowById>>,
  null
>;
type UpdateWorkflowPayload = z.infer<typeof updateWorkflowSchema>;

type Params = {
  params: {
    workflowId: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { workflowId } = params;
    const workflow = await getWorkflowById(workflowId);

    if (!workflow) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const payload: WorkflowDetail = workflow;
    return NextResponse.json({ workflow: payload });
  } catch (error) {
    console.error("워크플로우 조회 실패", error);
    return NextResponse.json(
      { message: "워크플로우를 조회하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = updateWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { workflowId } = params;
    const data: UpdateWorkflowPayload = parsed.data;
    const updated = await updateWorkflow(workflowId, data);

    if (!updated) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const payload: WorkflowDetail = updated;
    return NextResponse.json({ workflow: payload });
  } catch (error) {
    console.error("워크플로우 수정 실패", error);
    return NextResponse.json(
      { message: "워크플로우를 수정하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { workflowId } = params;
    const deleted = await deleteWorkflow(workflowId);

    if (!deleted) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("워크플로우 삭제 실패", error);
    return NextResponse.json(
      { message: "워크플로우를 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
