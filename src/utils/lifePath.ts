export function parseBirthdate(input: string): Date | null {
  const trimmed = input.trim();
  const match = /^(\d{2})[./-](\d{2})[./-](\d{4})$/.exec(trimmed);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm) - 1;
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month, day));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

export function formatDateForPg(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateLifePath(date: Date): number {
  const digits = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')
    .split('')
    .map(Number);

  const reduceToDigit = (arr: number[]): number => {
    let sum = arr.reduce((acc, n) => acc + n, 0);
    while (sum > 22) {
      sum = sum
        .toString()
        .split('')
        .map(Number)
        .reduce((acc, n) => acc + n, 0);
    }
    if (sum === 11 || sum === 22) return sum;
    while (sum > 9) {
      sum = sum
        .toString()
        .split('')
        .map(Number)
        .reduce((acc, n) => acc + n, 0);
    }
    return sum;
  };

  return reduceToDigit(digits);
}
