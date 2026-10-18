import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import index from "@/content/authored-lessons/index.json";
import type { AuthoredLesson } from "@/lib/authored-types";
import { uniqueAssessmentTasks } from "@/lib/authored-assessment";

export const getAuthoredLesson = cache(async (id: string): Promise<AuthoredLesson | null> => {
  if (!index.lessons.some((lesson) => lesson.id === id)) return null;
  const lesson = JSON.parse(await readFile(path.join(process.cwd(), "content", "authored-lessons", `${id}.json`), "utf8")) as AuthoredLesson;
  const assessment = uniqueAssessmentTasks(lesson.assessment);
  if (assessment.length === 0) throw new Error(`Authored lesson ${id} has no assessment tasks`);
  return { ...lesson, assessment };
});
