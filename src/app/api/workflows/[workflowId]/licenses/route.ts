import { NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";
import {
  getWorkflowAccess,
  grantWorkflowLicense,
  revokeWorkflowLicense,
} from "@/app/api/flow/workflows/_controllers/workflows";

interface RouteParams {
  params: Promise<{
    workflowId: string;
  }>;
}

export async function POST(_: Request, { params }: RouteParams) {
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

    if (access.isOwner) {
      return NextResponse.json(
        { message: "이미 소유한 워크플로우입니다." },
        { status: 400 },
      );
    }

    await grantWorkflowLicense({ workflowId, userId: sessionUserId });

    return NextResponse.json({
      workflowId,
      isOwner: false,
      isLicensed: true,
      ownership: "licensed" as const,
    });
  } catch (error) {
    console.error("워크플로우 라이선스 추가 실패", error);
    return NextResponse.json(
      { message: "라이선스를 추가하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
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

    if (access.isOwner) {
      return NextResponse.json(
        { message: "소유자는 라이선스를 해제할 수 없습니다." },
        { status: 400 },
      );
    }

    await revokeWorkflowLicense({ workflowId, userId: sessionUserId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("워크플로우 라이선스 삭제 실패", error);
    return NextResponse.json(
      { message: "라이선스를 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
