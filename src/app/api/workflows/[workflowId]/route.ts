import { NextResponse } from "next/server";
import {
  deleteWorkflow,
  getWorkflowAccess,
  getWorkflowById,
  updateWorkflow,
} from "@/app/api/flow/workflows/_controllers/workflows";
import { auth } from "@/features/auth/lib/auth";
import {
  type UpdateWorkflowPayload,
  updateWorkflowSchema,
} from "@/features/flow/types/workflow-api";
import { deserializeWorkflowDetail } from "@/features/flow/utils/workflow-transformers";

type Params = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id ?? null;
    if (!sessionUserId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { workflowId } = await params;
    const access = await getWorkflowAccess(workflowId, sessionUserId);

    if (!access) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!access.isOwner && !access.isLicensed) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 },
      );
    }

    const workflow = await getWorkflowById(workflowId);

    if (!workflow) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const payload = deserializeWorkflowDetail({
      ...workflow,
      isOwner: access.isOwner,
      isLicensed: access.isLicensed,
      ownership: access.isOwner ? "owner" : "licensed",
    });
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
    const session = await auth();
    const sessionUserId = session?.user?.id ?? null;
    if (!sessionUserId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = updateWorkflowSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { workflowId } = await params;
    const current = await getWorkflowById(workflowId);

    if (!current) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (current.ownerId !== sessionUserId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 },
      );
    }

    const data: UpdateWorkflowPayload = parsed.data;
    const updated = await updateWorkflow(workflowId, data);

    if (!updated) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const payload = deserializeWorkflowDetail({
      ...updated,
      isOwner: true,
      isLicensed: false,
      ownership: "owner",
    });
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
    const session = await auth();
    const sessionUserId = session?.user?.id ?? null;
    if (!sessionUserId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { workflowId } = await params;
    const current = await getWorkflowById(workflowId);

    if (!current) {
      return NextResponse.json(
        { message: "워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (current.ownerId !== sessionUserId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 },
      );
    }

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
