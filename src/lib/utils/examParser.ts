export function parseExamString(input: string): Record<number, number> {
  if (!input) return {};
  const result: Record<number, number> = {};
  const regex = /<(\d+);(\d+)>/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const q = parseInt(match[1], 10);
    const a = parseInt(match[2], 10);
    if (q > 0 && a >= 1 && a <= 4) result[q] = a;
  }
  return result;
}
