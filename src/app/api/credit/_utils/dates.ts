export const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isGrantedToday = (
  lastCheckInAt: Date | null | undefined,
  now: Date,
) => {
  if (!lastCheckInAt) return false;
  const startOfToday = getStartOfDay(now);
  return lastCheckInAt >= startOfToday;
};
