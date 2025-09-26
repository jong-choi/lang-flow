export const coercePagination = (params: { limit?: number; offset?: number }) => {
  const { limit = 20, offset = 0 } = params;
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const safeOffset = Math.max(Math.trunc(offset), 0);
  return { limit: safeLimit, offset: safeOffset };
};

