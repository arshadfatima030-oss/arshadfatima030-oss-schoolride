export const DEFAULT_TIME_ZONE = "Asia/Karachi";

export function todayInZone(timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
