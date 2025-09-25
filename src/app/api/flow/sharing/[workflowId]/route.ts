import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import {
  chargeCredit,
  consumeCredit,
  type CreditSummary,
  CreditOperationError,
  InsufficientCreditError,
  InvalidCreditAmountError,
} from "@/app/api/credit/_controllers/credit";
import { auth } from "@/features/auth/lib/auth";
import {
  getWorkflowShareDetail,
} from "@/features/flow/services/workflow-sharing-service";
import { workflowLicenses, workflowShares } from "@/features/flow/db/schema";
import { grantWorkflowLicense } from "@/app/api/flow/workflows/_controllers/workflows";
import { db } from "@/lib/db";

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

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    try {
      const workflowId = context.params.workflowId;
      const [share] = await db
        .select({
          ownerId: workflowShares.ownerId,
          price: workflowShares.priceInCredits,
        })
        .from(workflowShares)
        .where(eq(workflowShares.workflowId, workflowId))
        .limit(1);

      if (!share) {
        return NextResponse.json(
          { message: "공유된 워크플로우를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      if (share.ownerId === userId) {
        return NextResponse.json(
          { message: "이미 보유한 워크플로우입니다." },
          { status: 400 },
        );
      }

      const [existing] = await db
        .select({ userId: workflowLicenses.userId })
        .from(workflowLicenses)
        .where(
          and(
            eq(workflowLicenses.workflowId, workflowId),
            eq(workflowLicenses.userId, userId),
          ),
        )
        .limit(1);

      if (existing) {
        const detail = await getWorkflowShareDetail(workflowId, userId);
        if (!detail) {
          return NextResponse.json(
            { message: "워크플로우 정보를 불러오지 못했습니다." },
            { status: 500 },
          );
        }
        return NextResponse.json({ share: detail }, { status: 200 });
      }

      const price = share.price ?? 0;
      let creditSummary: CreditSummary | undefined;

      if (price > 0) {
        const creditResult = await consumeCredit({
          userId,
          amount: price,
          description: `워크플로우(${workflowId}) 구매`,
        });
        creditSummary = creditResult.summary;
      }

      try {
        await grantWorkflowLicense({ workflowId, userId });
      } catch (error) {
        if (price > 0) {
          await chargeCredit({
            userId,
            amount: price,
            description: `워크플로우(${workflowId}) 구매 실패 환불`,
          }).catch((refundError) => {
            console.error("워크플로우 구매 실패 환불에 실패했습니다.", refundError);
          });
        }
        throw error;
      }

      const detail = await getWorkflowShareDetail(workflowId, userId);

      if (!detail) {
        return NextResponse.json(
          { message: "워크플로우 정보를 불러오지 못했습니다." },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          share: detail,
          credit: creditSummary,
        },
        { status: 200 },
      );
    } catch (error) {
      if (
        error instanceof InvalidCreditAmountError ||
        error instanceof InsufficientCreditError ||
        error instanceof CreditOperationError
      ) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      const message =
        error instanceof Error
          ? error.message
          : "워크플로우를 구매하지 못했습니다.";
      return NextResponse.json({ message }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
