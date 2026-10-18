import index from "@/content/authored-lessons/index.json";

const topicPointCap = 100;

export function formatLessonPoints(points: number): string {
  const lastTwoDigits = Math.abs(points) % 100;
  const lastDigit = Math.abs(points) % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "баллов"
    : lastDigit === 1
      ? "балл"
      : lastDigit >= 2 && lastDigit <= 4
        ? "балла"
        : "баллов";
  return `${points} ${noun}`;
}

export function lessonPointsForId(lessonId: string): number {
  return index.lessons.find((lesson) => lesson.id === lessonId)?.points ?? 0;
}

export function lessonTopicIdForId(lessonId: string): string | null {
  const lesson = index.lessons.find((item) => item.id === lessonId);
  return lesson ? `g1-t${String(lesson.sourceTopic).padStart(2, "0")}` : null;
}

export function topicPointTotals(completedLessonIds: string[]): Record<string, number> {
  const completed = new Set(completedLessonIds);
  const totals: Record<string, number> = {};

  for (const lesson of index.lessons) {
    if (!completed.has(lesson.id)) continue;
    const topicId = `g1-t${String(lesson.sourceTopic).padStart(2, "0")}`;
    totals[topicId] = Math.min(topicPointCap, (totals[topicId] ?? 0) + lesson.points);
  }

  return totals;
}

export function totalLessonPoints(completedLessonIds: string[]): number {
  return Object.values(topicPointTotals(completedLessonIds)).reduce((total, points) => total + points, 0);
}
