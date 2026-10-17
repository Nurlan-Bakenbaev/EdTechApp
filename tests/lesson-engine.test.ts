import { describe, expect, it } from "vitest";
import blueprint from "@/task/SANAK_Blueprint_163_topics.json";
import generatedDrafts from "@/content/lesson-drafts.json";
import {
  createSpatialMicrotest,
  getSpatialHint,
  homeworkPrompts,
  homeworkTargetSeconds,
  lessonPhases,
  validateMathAnswer,
} from "@/lib/lesson-engine";

describe("Blueprint-based lesson engine", () => {
  it("keeps the four phases learner-paced and estimates a 20-25 minute lesson including homework", () => {
    expect(lessonPhases.map((phase) => phase.id)).toEqual(["A", "B", "C", "D"]);
    const estimatedMinutes = (lessonPhases.reduce((seconds, phase) => seconds + phase.targetSeconds, 0) + homeworkTargetSeconds) / 60;
    expect(estimatedMinutes).toBeGreaterThanOrEqual(20);
    expect(estimatedMinutes).toBeLessThanOrEqual(25);
    expect(homeworkPrompts).toHaveLength(6);
  });

  it("builds ten distinct, checkable spatial questions with accessible correct options", () => {
    const questions = createSpatialMicrotest();
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map((question) => question.id)).size).toBe(10);

    for (const question of questions) {
      expect(question.prompt.ru.trim()).not.toBe("");
      expect(question.prompt.ky.trim()).not.toBe("");
      expect(question.options.length).toBeGreaterThanOrEqual(3);
      const expected = question.validator.kind === "choice-equality"
        ? question.validator.expected
        : question.validator.kind === "spatial-position"
          ? question.validator.expected
          : "";
      expect(question.options.some((option) => option.value === expected)).toBe(true);
      expect(validateMathAnswer(question.validator, expected)).toBe(true);
    }
  });

  it("creates new mirrored variants for retries without breaking answer validation", () => {
    const original = createSpatialMicrotest(0);
    const horizontal = createSpatialMicrotest(1);
    const vertical = createSpatialMicrotest(2);

    expect(horizontal.map((question) => question.id)).not.toEqual(original.map((question) => question.id));
    expect(vertical.map((question) => question.id)).not.toEqual(horizontal.map((question) => question.id));
    for (const questions of [horizontal, vertical]) {
      for (const question of questions) {
        const expected = question.validator.kind === "spatial-position" || question.validator.kind === "choice-equality"
          ? question.validator.expected
          : "";
        expect(question.options.some((option) => option.value === expected)).toBe(true);
        expect(validateMathAnswer(question.validator, expected)).toBe(true);
      }
    }
  });

  it("increases scaffold detail after repeated mistakes and rejects invalid mathematics", () => {
    expect(getSpatialHint(1, "ru")).not.toBe(getSpatialHint(2, "ru"));
    expect(getSpatialHint(2, "ky")).not.toBe(getSpatialHint(3, "ky"));
    expect(validateMathAnswer({ kind: "integer-equality", expected: 5 }, "5.0")).toBe(false);
    expect(validateMathAnswer({ kind: "fraction-equality", numerator: 1, denominator: 2, expectedNumerator: 1, expectedDenominator: 2 }, "1/0")).toBe(false);
  });

  it("generates review-gated drafts for all 163 passports without marking any lesson publishable", () => {
    expect(blueprint.topics).toHaveLength(163);
    expect(generatedDrafts.drafts).toHaveLength(163);
    expect(new Set(generatedDrafts.drafts.map((draft) => draft.source.track)).size).toBe(3);
    expect(generatedDrafts.drafts.every((draft) => draft.publishable === false && draft.status === "draft")).toBe(true);
    expect(generatedDrafts.drafts.every((draft) => draft.scenes.map((scene) => scene.id).join("") === "ABCD")).toBe(true);
    expect(generatedDrafts.drafts.every((draft) => draft.review.math === "pending" && draft.review.kyrgyz === "pending")).toBe(true);
    expect(generatedDrafts.drafts.every((draft) => draft.validator.executable === false)).toBe(true);
    expect(generatedDrafts.drafts.some((draft) => draft.source.track === "KG11_TRANSITION" && draft.source.grade.includes("3"))).toBe(true);
    expect(generatedDrafts.drafts.some((draft) => draft.source.track === "KG12" && draft.source.grade.includes("3"))).toBe(true);
  });
});
