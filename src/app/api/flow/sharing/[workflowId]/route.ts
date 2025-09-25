import { NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";
import {
  getWorkflowShareDetail,
  requestWorkflowLicense,
} from "@/features/flow/services/workflow-sharing-service";
import { workflowLicenseRequestSchema } from "@/features/flow/types/workflow-sharing";

interface RouteContext {
  params: { workflowId: string };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    const detail = await getWorkflowShareDetail(
      context.params.workflowId,
      viewerId ?? undefined,
    );
    if (!detail) {
      return NextResponse.json(
        { message: "공유된 워크플로우를 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    return NextResponse.json({ share: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = workflowLicenseRequestSchema.safeParse(json);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    try {
      const license = await requestWorkflowLicense(
        context.params.workflowId,
        userId,
        parsed.data,
      );
      return NextResponse.json({ license }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "라이선스 요청에 실패했습니다.";
      return NextResponse.json({ message }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
