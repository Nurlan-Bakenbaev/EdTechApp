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
          expect(
            new Set(task.options?.map((item) => item.value)).size,
            `${slot.id}: ${task.prompt.ru}`,
          ).toBe(task.options?.length);
        }
      }
    }
  });

  it("renders matching fruit illustrations for data-comparison tasks", () => {
    const dataSlots = slots.filter((slot) => slot.topic.family === "data");
    expect(dataSlots.length).toBeGreaterThan(0);
    for (const slot of dataSlots) {
      for (const task of createPracticeTasks(slot)) {
        expect(task.fruitGroups).toHaveLength(2);
        expect(task.fruitGroups?.map((group) => group.fruit)).toEqual(["apple", "pear"]);
        expect(task.fruitGroups?.every((group) => group.count > 0)).toBe(true);
      }
    }
  });

  it("uses fruit illustrations in equal-group and word-problem tasks", () => {
    const illustratedSlots = slots.filter(
      (slot) => slot.topic.family === "multiplication" || slot.topic.family === "word-problems",
    );
    expect(illustratedSlots.length).toBeGreaterThan(0);

    for (const slot of illustratedSlots) {
      for (const task of createPracticeTasks(slot)) {
        expect(task.fruitGroups, `${slot.id}: ${task.prompt.ru}`).toBeDefined();
        expect(task.fruitGroups?.length).toBeGreaterThan(0);
        expect(task.fruitGroups?.every((group) => group.count > 0)).toBe(true);
        if (slot.topic.family === "multiplication") {
          const [group] = task.fruitGroups ?? [];
          expect(group?.groupCount).toBeGreaterThan(1);
          expect((group?.groupCount ?? 0) * (group?.count ?? 0)).toBeGreaterThan(0);
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
      if (
        slot.topic.family === "data"
        || slot.topic.family === "word-problems"
        || slot.topic.family === "multiplication"
      ) {
        expect(guide.fruitGroups?.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps specialized practice aligned with fractions, operations, and data topics", () => {
    const tasksFor = (grade: 1 | 2, topic: number) => {
      const slot = slots.find((item) => item.grade === grade && item.topic.sourceOrder === topic);
      expect(slot).toBeDefined();
      return createPracticeTasks(slot!);
    };

    for (const task of tasksFor(1, 29)) {
      expect(task.prompt.ru).toContain("половин");
      expect(task.prompt.ru).not.toContain("четверт");
    }
    for (const task of tasksFor(2, 11)) {
      expect(task.options?.map((item) => item.value)).toContain("half");
      expect(task.options?.map((item) => item.value)).toContain("quarter");
    }
    expect(tasksFor(2, 19).some((task) => /×|÷/.test(task.prompt.ru))).toBe(true);
    expect(tasksFor(2, 21).some((task) => task.prompt.ru.includes("во сколько раз меньше"))).toBe(true);
    expect(tasksFor(2, 21).some((task) => task.prompt.ru.includes("закономерность"))).toBe(true);
    expect(new Set(tasksFor(2, 24).map((task) => task.answer)).size).toBe(3);
    expect(tasksFor(2, 25).every((task) => task.fruitGroups?.length === 2)).toBe(true);
    for (const task of tasksFor(1, 10)) {
      const [group] = task.fruitGroups ?? [];
      expect((group?.groupCount ?? 0) * (group?.count ?? 0)).toBeLessThanOrEqual(20);
    }
    for (const task of tasksFor(2, 3)) {
      expect(Number(task.answer)).toBeGreaterThanOrEqual(0);
      expect(Number(task.answer)).toBeLessThanOrEqual(100);
    }
  });

});
