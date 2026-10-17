import { describe, expect, it } from "vitest";
import { expandLessonSlots } from "@/lib/curriculum";
import { getLessonGuide } from "@/lib/lesson-guide";
import { createPracticeTasks, topicObjective } from "@/lib/practice";

describe("practice engine", () => {
  const slots = [...expandLessonSlots(1), ...expandLessonSlots(2)];

  it("generates six deterministic tasks for all 228 lesson-hours", () => {
    for (const slot of slots) {
      const first = createPracticeTasks(slot);
      const second = createPracticeTasks(slot);
      expect(first).toEqual(second);
      expect(first).toHaveLength(6);
      expect(new Set(first.map((task) => task.id)).size).toBe(6);
    }
  });

  it("keeps every choice answer reachable", () => {
    for (const slot of slots) {
      for (const task of createPracticeTasks(slot)) {
        expect(task.prompt.ru.trim()).not.toBe("");
        expect(task.prompt.ky.trim()).not.toBe("");
        expect(task.hint.ru.trim()).not.toBe("");
        expect(task.explanation.ky.trim()).not.toBe("");
        if (task.kind === "choice") {
          expect(task.options?.some((item) => item.value === task.answer)).toBe(true);
        }
      }
    }
  });

  it("defines a bilingual objective for every topic family", () => {
    for (const slot of slots) {
      const objective = topicObjective(slot.topic);
      expect(objective.ru.length).toBeGreaterThan(5);
      expect(objective.ky.length).toBeGreaterThan(5);
    }
  });

  it("provides a bilingual guided lesson and a checkable warm-up for every lesson hour", () => {
    for (const slot of slots) {
      const guide = getLessonGuide(slot);
      expect(guide.steps).toHaveLength(3);
      expect(guide.steps.every((step) => step.ru.trim() && step.ky.trim())).toBe(true);
      expect(guide.example.ru.trim()).not.toBe("");
      expect(guide.example.ky.trim()).not.toBe("");
      expect(guide.options.some((option) => option.value === guide.answer)).toBe(true);
    }
  });

});
