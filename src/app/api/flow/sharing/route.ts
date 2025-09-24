import { NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";
import {
  listSharedWorkflows,
  createWorkflowShare,
} from "@/features/flow/services/workflow-sharing-service";
import { workflowShareFormSchema } from "@/features/flow/utils/workflow-sharing-schemas";

export async function GET() {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    const shares = await listSharedWorkflows(viewerId ?? undefined);
    return NextResponse.json({ shares });
  } catch (error) {
    return NextResponse.json(
      { message: "공유된 워크플로우를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    const parsed = workflowShareFormSchema.safeParse(payload);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "요청 본문을 확인해주세요.";
      return NextResponse.json({ message }, { status: 400 });
    }

    try {
      const detail = await createWorkflowShare(
        parsed.data.workflowId,
        userId,
        parsed.data,
      );
      if (!detail) {
        return NextResponse.json(
          { message: "공유 정보를 생성하지 못했습니다." },
          { status: 500 },
        );
      }
      return NextResponse.json({ share: detail }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "워크플로우 공유 등록에 실패했습니다.";
      const status = message.includes("권한") ? 403 : 400;
      return NextResponse.json({ message }, { status });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "워크플로우 공유 등록에 실패했습니다." },
      { status: 500 },
    );
  }
}

