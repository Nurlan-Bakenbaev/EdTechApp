import { describe, expect, it } from "vitest";
import index from "@/content/authored-lessons/index.json";
import { formatLessonPoints, lessonPointsForId, lessonTopicIdForId, topicPointTotals, totalLessonPoints } from "@/lib/lesson-points";

describe("authored lesson points", () => {
  it("allocates exactly 100 whole points to each topic according to difficulty", () => {
    const topics = new Map<string, number>();
    for (const lesson of index.lessons) {
      const topicId = lessonTopicIdForId(lesson.id)!;
      topics.set(topicId, (topics.get(topicId) ?? 0) + lessonPointsForId(lesson.id));
    }

    expect(topics.size).toBe(30);
    expect([...topics.values()].every((points) => points === 100)).toBe(true);
    expect(index.lessons.every((lesson) => Number.isInteger(lesson.difficulty) && lesson.difficulty > 0)).toBe(true);
    expect(index.lessons.every((lesson) => Number.isInteger(lesson.points) && lesson.points > 0)).toBe(true);
    expect(lessonPointsForId("g1_l002")).toBeGreaterThan(lessonPointsForId("g1_l001"));
  });

  it("counts completed lessons once and never lets a topic exceed 100", () => {
    const completed = index.lessons
      .filter((lesson) => lesson.sourceTopic === 4)
      .map((lesson) => lesson.id);
    const totals = topicPointTotals([...completed, completed[0], "unknown"]);

    expect(totals["g1-t04"]).toBe(100);
    expect(totalLessonPoints([...completed, completed[0]])).toBe(100);
    expect(topicPointTotals(["g1_l001"])["g1-t04"]).toBe(lessonPointsForId("g1_l001"));
  });

  it("formats Russian point amounts with the correct noun form", () => {
    expect(formatLessonPoints(1)).toBe("1 балл");
    expect(formatLessonPoints(3)).toBe("3 балла");
    expect(formatLessonPoints(12)).toBe("12 баллов");
    expect(formatLessonPoints(21)).toBe("21 балл");
  });
});
