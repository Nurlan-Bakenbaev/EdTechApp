import { describe, expect, it } from "vitest";
import {
  curriculumByGrade,
  expandLessonSlots,
  getLessonSlot,
  grade1Topics,
  grade2Topics,
  totalHours,
} from "@/lib/curriculum";

describe("curriculum source invariants", () => {
  it("preserves the Grade 1 KTP totals", () => {
    expect(grade1Topics).toHaveLength(33);
    expect(totalHours(grade1Topics)).toBe(96);
    expect(grade1Topics[0]).toMatchObject({ sourceNumber: 1, hours: 4, titleRu: "Ориентация в пространстве" });
  });

  it("preserves the Grade 2 KTP totals and numbering anomaly", () => {
    expect(grade2Topics).toHaveLength(25);
    expect(totalHours(grade2Topics)).toBe(132);
    expect(grade2Topics[1].sourceNumber).toBeNull();
    expect(grade2Topics.some((topic) => topic.sourceNumber === 14)).toBe(false);
    expect(grade2Topics[14].sourceNumber).toBe(15);
  });

  it("expands every academic hour into a navigable lesson slot", () => {
    expect(expandLessonSlots(1)).toHaveLength(96);
    expect(expandLessonSlots(2)).toHaveLength(132);
    expect([...expandLessonSlots(1), ...expandLessonSlots(2)]).toHaveLength(228);
    expect(getLessonSlot(1, 1, 4)?.id).toBe("g1-t01-h4");
    expect(getLessonSlot(1, 1, 5)).toBeUndefined();
  });

  it("contains a Kyrgyz draft title for every source row", () => {
    for (const topics of Object.values(curriculumByGrade)) {
      for (const topic of topics) {
        expect(topic.titleKy.trim().length).toBeGreaterThan(2);
        expect(topic.translationStatus).toBe("draft-review-required");
      }
    }
  });
});
