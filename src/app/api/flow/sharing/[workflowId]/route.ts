import { NextResponse } from "next/server";
import { chargeCredit } from "@/app/api/credit/_controllers/charge";
import { consumeCredit } from "@/app/api/credit/_controllers/consume";
import {
  grantWorkflowLicense,
  revokeWorkflowLicense,
} from "@/app/api/flow/workflows/_controllers/workflows";
import { auth } from "@/features/auth/lib/auth";
import {
  type CreditHistory,
  type CreditSummary,
} from "@/features/credit/types/credit";
import {
  getShareOwnerAndPrice,
  hasUserWorkflowLicense,
} from "@/features/flow/services/workflow-purchase-service";
import { getWorkflowShareDetail } from "@/features/flow/services/workflow-sharing-service";

interface RouteContext {
  params: Promise<{ workflowId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    const detail = await getWorkflowShareDetail(
      (await context.params).workflowId,
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
      const workflowId = (await context.params).workflowId;
      const share = await getShareOwnerAndPrice(workflowId);
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

      const existing = await hasUserWorkflowLicense(workflowId, userId);
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

      const price = share.priceInCredits ?? 0;
      let creditSummary: CreditSummary | undefined;
      let creditHistoryType: CreditHistory["type"] | undefined;

      if (price > 0) {
        const creditResult = await consumeCredit({
          userId,
          amount: price,
          description: `워크플로우(${workflowId}) 구매`,
        });
        creditSummary = creditResult.summary;
        creditHistoryType = creditResult.history.type;
      }

      let granted = false;
      try {
        granted = await grantWorkflowLicense({ workflowId, userId });
      } catch (error) {
        if (price > 0) {
          await chargeCredit({
            userId,
            amount: price,
            description: `워크플로우(${workflowId}) 구매 실패 환불`,
          }).catch((refundError) => {
            console.error(
              "워크플로우 구매 실패 환불에 실패했습니다.",
              refundError,
            );
          });
        }
        throw error;
      }

      if (!granted) {
        if (price > 0) {
          await chargeCredit({
            userId,
            amount: price,
            description: `워크플로우(${workflowId}) 중복 구매 환불`,
          }).catch((refundError) => {
            console.error(
              "워크플로우 중복 구매 환불에 실패했습니다.",
              refundError,
            );
          });
        }

        const detail = await getWorkflowShareDetail(workflowId, userId);
        if (!detail) {
          return NextResponse.json(
            { message: "워크플로우 정보를 불러오지 못했습니다." },
            { status: 500 },
          );
        }
        return NextResponse.json({ share: detail }, { status: 200 });
      }

      const shouldGrantSellerCredit =
        price > 0 && creditHistoryType === "consume";

      if (shouldGrantSellerCredit) {
        try {
          await chargeCredit({
            userId: share.ownerId,
            amount: price,
            description: `워크플로우(${workflowId}) 판매 수익`,
          });
        } catch (sellerCreditError) {
          await revokeWorkflowLicense({ workflowId, userId }).catch(
            (revokeError) => {
              console.error(
                "워크플로우 판매 정산 실패 후 라이선스 회수에 실패했습니다.",
                revokeError,
              );
            },
          );

          await chargeCredit({
            userId,
            amount: price,
            description: `워크플로우(${workflowId}) 판매 정산 실패 환불`,
          }).catch((refundError) => {
            console.error(
              "워크플로우 판매 정산 실패 환불에 실패했습니다.",
              refundError,
            );
          });

          throw sellerCreditError;
        }
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
      if (error instanceof Error) {
        const msg = error.message || String(error);
        if (/금액|크레딧/.test(msg)) {
          return NextResponse.json({ message: msg }, { status: 400 });
        }
        return NextResponse.json({ message: msg }, { status: 400 });
      }
      return NextResponse.json(
        { message: "워크플로우를 구매하지 못했습니다." },
        { status: 400 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
