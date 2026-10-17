export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getPreviousDateKey(date: Date): string {
  const previousDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  return getLocalDateKey(previousDate);
}

export function getCurrentStudyStreak(
  streak: number,
  lastStudyDate: string | null,
  today = new Date(),
): number {
  if (!lastStudyDate || !isDateKey(lastStudyDate)) return 0;
  const todayKey = getLocalDateKey(today);
  return lastStudyDate === todayKey || lastStudyDate === getPreviousDateKey(today) ? streak : 0;
}

export function getNextStudyStreak(
  streak: number,
  lastStudyDate: string | null,
  today = new Date(),
): number {
  const todayKey = getLocalDateKey(today);
  if (lastStudyDate === todayKey) return streak;
  return lastStudyDate === getPreviousDateKey(today) ? streak + 1 : 1;
}

export function getRussianDayUnit(count: number): string {
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "дней";
  switch (count % 10) {
    case 1:
      return "день";
    case 2:
    case 3:
    case 4:
      return "дня";
    default:
      return "дней";
  }
}
