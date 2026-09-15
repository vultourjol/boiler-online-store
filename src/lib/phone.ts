export function formatPhone(value: string): string {
  const digits = value.replace(/[^\d]/g, "").replace(/^8/, "7");
  const normalized = digits.startsWith("7") ? digits.slice(1) : digits;
  const parts: string[] = [];
  if (normalized) parts.push("+7");
  if (normalized.length > 0) parts.push(normalized.slice(0, 3));
  if (normalized.length > 3) parts.push(normalized.slice(3, 6));
  if (normalized.length > 6) parts.push(normalized.slice(6, 8));
  if (normalized.length > 8) parts.push(normalized.slice(8, 10));
  return parts.join("-");
}

export function isValidPhone(value: string): boolean {
  return /^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/.test(value);
}