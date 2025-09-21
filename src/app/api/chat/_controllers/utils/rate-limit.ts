import { sessionStore } from "./session-store";

const RATE_LIMIT = 10;

export type RateLimitResult = {
  allowed: boolean;
  currentCount: number;
  remainingCount: number;
};

export function checkRateLimit(sessionId: string): RateLimitResult {
  const session = sessionStore.get(sessionId);

  const currentCount = session?.count || 0;
  const allowed = currentCount <= RATE_LIMIT;
  const remainingCount = Math.max(0, RATE_LIMIT - currentCount);

  return {
    allowed,
    currentCount,
    remainingCount,
  };
}
