import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWorkflow,
  listWorkflows,
} from "@/app/api/flow/workflows/_controllers/workflows";
import { auth } from "@/features/auth/lib/auth";
import type { WorkflowSummary } from "@/features/flow/types/workflow";
import {
  workflowEdgePayloadSchema,
  workflowMetadataSchema,
  workflowNodePayloadSchema,
} from "@/features/flow/types/workflow-api";
import { deserializeWorkflowDetail } from "@/features/flow/utils/workflow-transformers";

const createWorkflowSchema = workflowMetadataSchema.extend({
  nodes: z.array(workflowNodePayloadSchema).optional(),
  edges: z.array(workflowEdgePayloadSchema).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id ?? null;

    if (!sessionUserId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const ownerIdParam = searchParams.get("ownerId");

    if (ownerIdParam && ownerIdParam !== sessionUserId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 },
      );
    }

    const ownedOnly = Boolean(ownerIdParam);
    const workflows = await listWorkflows({
      userId: sessionUserId,
      ownedOnly,
    });
    const payload: WorkflowSummary[] = workflows.map((workflow) => ({
      ...workflow,
      ownership: workflow.isOwner ? "owner" : "licensed",
    }));

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
    const session = await auth();
    const sessionUserId = session?.user?.id ?? null;

    if (!sessionUserId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = createWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { name, description, nodes, edges } = parsed.data;
    const workflow = await createWorkflow({
      name,
      ownerId: sessionUserId,
      description: description ?? null,
      nodes,
      edges,
    });

    const payload = deserializeWorkflowDetail({
      ...workflow,
      isOwner: true,
      isLicensed: false,
      ownership: "owner",
    });

    return NextResponse.json({ workflow: payload }, { status: 201 });
  } catch (error) {
    console.error("워크플로우 생성 실패", error);
    return NextResponse.json(
      { message: "워크플로우를 생성하지 못했습니다." },
      { status: 500 },
    );
  }
}
