

export function createDateAtMidnight(year: number, month: number, day: number): Date {
  const date = new Date(year, month - 1, day); // Note: Month is 0-based in JavaScript Dates
  date.setHours(0, 0, 0, 0);
  return date;
}