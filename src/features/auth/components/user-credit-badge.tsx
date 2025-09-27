"use client";

import * as React from "react";
import { CircleStar } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreditDailyBonusResponse,
  CreditSummaryResponse,
  // TODO: 컴포넌트 분리예정
  // eslint-disable-next-line import/no-restricted-paths
} from "@/features/credit/types/credit-apis";
import { api } from "@/lib/api-client";

interface UserCreditBadgeProps {
  userId?: string;
}

const creditQueryKey = (userId?: string) => ["credit", "summary", userId];

export function UserCreditBadge({ userId }: UserCreditBadgeProps) {
  const queryClient = useQueryClient();
  const hasRequestedRef = React.useRef(false);

  const creditQuery = useQuery<CreditSummaryResponse>({
    queryKey: creditQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    queryFn: async () =>
      api.get<CreditSummaryResponse>("/api/credit", {
        params: { userId },
      }),
  });

  React.useEffect(() => {
    if (!userId || hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    const claimDailyBonus = async () => {
      try {
        const response = await api.post<CreditDailyBonusResponse>(
          "/api/credit/daily-bonus",
        );

        queryClient.setQueryData(creditQueryKey(userId), {
          credit: response.credit,
        });

        if (response.granted && response.history?.amount) {
          toast.success("출석 보상이 지급되었습니다.", {
            description: `+${response.history.amount} 크레딧`,
            icon: <CircleStar className="size-5 text-amber-500" />,
            action: {
              label: "확인",
              onClick: () => undefined,
            },
          });
        }
      } catch (error) {
        hasRequestedRef.current = false;
        console.error("Failed to claim daily bonus", error);
      }
    };

    void claimDailyBonus();
  }, [queryClient, userId]);

  const balance = creditQuery.data?.credit.balance;
  const displayBalance =
    typeof balance === "number" ? `${balance.toLocaleString()} 크레딧` : "--";

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground">
      <CircleStar className="size-4 text-amber-500" />
      <span className="tabular-nums">{displayBalance}</span>
    </div>
  );
}
