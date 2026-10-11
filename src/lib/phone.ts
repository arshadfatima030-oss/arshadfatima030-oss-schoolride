/**
 * Normalises Pakistani mobile numbers to E.164 (+923XXXXXXXXX).
 * Accepts 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX, +923XXXXXXXXX, 00923XXXXXXXXX, with spaces or dashes.
 */
export function normalizePkPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+/, "").replace(/^00/, "");
  const match = digits.match(/^(?:92|0)?(3\d{9})$/);
  return match ? `+92${match[1]}` : null;
}
