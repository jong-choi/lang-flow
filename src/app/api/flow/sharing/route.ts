import { NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";
import {
  createWorkflowShare,
  listSharedWorkflows,
} from "@/features/flow/services/workflow-sharing-service";
import { workflowShareFormSchema } from "@/features/flow/types/workflow-sharing";

export async function GET() {
  try {
    const shares = await listSharedWorkflows();
    return NextResponse.json({ shares });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
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
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes("권한") ? 403 : 400;
      return NextResponse.json({ message }, { status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
