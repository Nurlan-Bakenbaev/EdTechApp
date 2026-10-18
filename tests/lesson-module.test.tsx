import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { AppProviders, useProgress } from "@/app/providers";
import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";
import { AuthoredCoursePage } from "@/components/authored-course";
import { AuthoredLessonPage } from "@/components/authored-lesson";
import { LessonExercises } from "@/components/LessonExercises";
import { ArbeitsblattGenerator } from "@/components/ArbeitsblattGenerator";
import { LessonAdventureMap } from "@/components/lesson-adventure-map";
import { MathModelView } from "@/components/math-model";
import { AuthoredTaskView } from "@/components/authored-task";
import { uniqueAssessmentTasks } from "@/lib/authored-assessment";
import { lessonMascotForId } from "@/lib/lesson-mascot";
import type { AuthoredLesson } from "@/lib/authored-types";
import type { AuthoredTask } from "@/lib/authored-types";
import { getLessonSlot } from "@/lib/curriculum";
import type { PracticeTask } from "@/lib/practice";
import { lessonFruitCountLabel, lessonFruitForId, replaceCounterNouns } from "@/lib/lesson-fruit";
import authoredLesson from "@/content/authored-lessons/g1_l001.json";

const authoredLessonFixture: AuthoredLesson = {
  id: authoredLesson.id,
  courseId: authoredLesson.courseId,
  contentHash: "",
  title: authoredLesson.title,
  order: authoredLesson.order,
  blockId: authoredLesson.blockId,
  sourceTopic: authoredLesson.sourceTopic,
  topic: authoredLesson.topic,
  duration: authoredLesson.duration,
  objectives: authoredLesson.objectives,
  explanation: authoredLesson.explanation,
  steps: authoredLesson.steps as AuthoredTask[],
  practice: authoredLesson.practice as AuthoredTask[],
  assessment: uniqueAssessmentTasks(authoredLesson.assessment as AuthoredTask[]),
  threshold: 8,
  homework: [],
  parentNote: "",
  print: { tasks: [] },
  summary: authoredLesson.summary,
  reflection: { question: "", options: [] },
  nextId: null,
  video: { src: null, captions: null },
};
const authoredFruitTask: AuthoredTask = {
  id: "g1_l001_step1",
  instruction: "Сколько фишек? Выбери фишку.",
  interaction: "select_quantity",
  objects: [
    { id: "model", state: { renderer: "countable_objects", count: 2, label: "Фишки" }, zone: "demonstration", label: "Фишки" },
    { id: "one", state: { value: 1 }, zone: "answer", label: "Фишка ответа 1" },
    { id: "two", state: { value: 2 }, zone: "answer", label: "Фишка ответа 2" },
  ],
  rule: { rule_type: "unique_count_equal", expected_count: 1, allowed_ids: ["one", "two"], state_field: "selected_ids" },
  explanation: "Посчитай каждую фишку один раз.",
  feedback: { correct: "Ты выбрал фишку.", incorrect: "Попробуй посчитать фишки.", incomplete: "Выбери фишку." },
  hints: [{ level: 1, text: "Рассмотри фишки." }],
};

vi.mock("framer-motion", () => ({ motion: { div: ({ children, className }: { children: React.ReactNode; className: string }) => <div className={className}>{children}</div>, p: ({ children }: { children: React.ReactNode }) => <p>{children}</p> }, useReducedMotion: () => true }));

const task: PracticeTask = { id: "sample", kind: "choice", prompt: { ru: "Сколько яблок?", ky: "Канча алма?" }, answer: "2", options: [{ value: "1", ru: "Один", ky: "Бир" }, { value: "2", ru: "Два", ky: "Эки" }], hint: { ru: "Посчитай ещё раз", ky: "Кайра сана" }, explanation: { ru: "Два яблока", ky: "Эки алма" } };
let container: HTMLDivElement;
let root: Root;
const button = (label: string) => Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.includes(label))!;
async function click(label: string) { await act(async () => button(label).click()); }
async function render(children: React.ReactNode) {
  await act(async () => root.render(<AppProviders>{children}</AppProviders>));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 15)); });
}

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); });

describe("lesson module", () => {
  it("removes repeated assessment questions and caps each test at ten tasks", () => {
    const assessment = uniqueAssessmentTasks(authoredLesson.assessment as AuthoredTask[]);
    expect(assessment).toHaveLength(5);
    expect(uniqueAssessmentTasks([...assessment, ...assessment])).toHaveLength(5);
    expect(uniqueAssessmentTasks(Array.from({ length: 12 }, (_, index) => ({
      ...authoredFruitTask,
      id: `g1_l001_test${index + 1}`,
      instruction: `Посчитай ${index + 1} предметов.`,
      objects: authoredFruitTask.objects.map((object) => ({
        ...object,
        state: object.state.renderer === "countable_objects" ? { ...object.state, count: index + 1 } : object.state,
      })),
      rule: { ...authoredFruitTask.rule, expected_count: index + 1 },
    })))).toHaveLength(10);
  });

  it("keeps every authored lesson test within the ten-question limit", () => {
    const directory = path.join(process.cwd(), "content", "authored-lessons");
    const lessonFiles = readdirSync(directory).filter((file) => /^g1_l\d{3}\.json$/.test(file));
    expect(lessonFiles).toHaveLength(85);

    for (const file of lessonFiles) {
      const lesson = JSON.parse(readFileSync(path.join(directory, file), "utf8")) as { assessment: AuthoredTask[] };
      const assessment = uniqueAssessmentTasks(lesson.assessment);
      expect(assessment.length, file).toBeGreaterThan(0);
      expect(assessment.length, file).toBeLessThanOrEqual(10);
      expect(uniqueAssessmentTasks([...assessment, ...assessment]).map((task) => task.id), file)
        .toEqual(assessment.map((task) => task.id));
    }
  });

  it("shows the unique test and does not show a separate practice list", async () => {
    await render(<AuthoredLessonPage lesson={authoredLessonFixture} />);
    expect(container.textContent).not.toContain("Попробуй сам");
    expect(container.textContent).not.toContain("Практика 1");
    expect(container.querySelector(".authored-tabs")?.textContent).toContain("Тест · 5 заданий");

    await click("Тест · 5 заданий");
    expect(container.querySelectorAll(".authored-task-nav button")).toHaveLength(5);
  });

  it("offers a colorful adventure map and keeps the familiar lesson list", async () => {
    await render(<AuthoredCoursePage />);
    expect(container.querySelector(".kid-adventure-map")).not.toBeNull();
    expect(container.querySelectorAll(".kid-map-stop")).toHaveLength(85);
    expect(container.querySelector('.kid-map-stop[href="/course/grade-1/g1_l001"]')).not.toBeNull();
    expect(new Set(Array.from(container.querySelectorAll(".kid-map-art")).slice(0, 6).map((item) => item.textContent)).size).toBeGreaterThan(1);
    expect(container.querySelector(".course-hero-mentor")?.getAttribute("src")).toContain("zhyldyz-mentor.png");

    await click("Список уроков");
    expect(container.querySelector(".kid-adventure-map")).toBeNull();
    expect(container.querySelector(".authored-blocks")).not.toBeNull();
    expect(container.querySelectorAll(".authored-lesson-list a")).toHaveLength(85);

    await click("Карта приключений");
    expect(container.querySelector(".kid-adventure-map")).not.toBeNull();
  });

  it("uses varied fruit illustrations instead of generic counters", async () => {
    await render(<MathModelView model={{ renderer: "countable_objects", count: 4 }} label="Яблоки" fruit="apple" />);
    expect(container.querySelectorAll(".authored-fruit-item")).toHaveLength(4);
    expect(container.querySelector(".authored-fruit-model")?.getAttribute("aria-label")).toContain("Яблоки");
    expect(container.querySelector(".authored-fruit-model")?.getAttribute("aria-label")).toContain("4 яблока");
    expect(lessonFruitForId("g1_l001_step1")).toBe("apple");
    expect(lessonFruitForId("g1_l002_step1")).toBe("pear");
    expect(replaceCounterNouns("Сколько фишек? Выбери фишку. Каждая фишка обозначает единицу.", "apple")).toBe("Сколько яблок? Выбери яблоко. Каждое яблоко обозначает единицу.");
    expect(replaceCounterNouns("Каждую фишку считаем один раз.", "apple")).toBe("Каждое яблоко считаем один раз.");
    expect(replaceCounterNouns("Каждую фишку считаем один раз.", "pear")).toBe("Каждую грушу считаем один раз.");
    expect(replaceCounterNouns("Каждая фишка обозначает одну единицу.", "banana")).toBe("Каждый банан обозначает одну единицу.");
    expect(lessonFruitCountLabel("apple", 5)).toBe("5 яблок");
    expect(lessonFruitCountLabel("pear", 2)).toBe("2 груши");

    await render(<MathModelView model={{ renderer: "operation_scene", operation: "add", a: 2, b: 3 }} label="Пример" fruit="pear" />);
    expect(container.querySelectorAll(".authored-fruit-item")).toHaveLength(5);
    expect(container.querySelector(".authored-fruit-model")?.classList.contains("operation-add")).toBe(true);
  });

  it("uses fruit pictures and fruit wording in authored counting tasks", async () => {
    await render(<AuthoredTaskView task={authoredFruitTask} progress={{ work: {}, hints: 0 }} onChange={vi.fn()} />);
    expect(container.querySelector(".authored-task-heading h3")?.textContent).toBe("Сколько яблок? Выбери яблоко.");
    expect(container.querySelectorAll(".authored-fruit-item")).toHaveLength(4);
    expect(container.querySelector('button[aria-label="Яблоко ответа 2"]')).not.toBeNull();
    expect(container.querySelectorAll(".authored-object .authored-fruit-item")).toHaveLength(2);
    expect(container.textContent).toContain("яблок");
  });

  it("shows a friendly lesson mascot in explanations and on incorrect-answer feedback", async () => {
    expect(lessonMascotForId("g1_l001_step1").src).toBe("/assets/mascots/math-cat.webp");
    expect(lessonMascotForId("g1_l002_step1").src).toBe("/assets/mascots/math-capybara.webp");
    expect(lessonMascotForId("g1_l003_test01").src).toBe("/assets/mascots/math-raccoon.webp");

    await render(<LessonVideoPlayer lesson={authoredLessonFixture} onContinue={vi.fn()} />);
    expect(container.querySelector(".lesson-video-stage")?.getAttribute("data-lesson-mascot")).toBe("котёнок");
    expect(container.querySelector(".lesson-video-stage")?.getAttribute("style")).toContain("/assets/mascots/math-cat.webp");
    await click("3. Разбираем пример");
    expect(container.querySelector(".lesson-video-caption p")?.textContent).toContain("Сколько яблок в рамке?");
    expect(container.querySelector(".lesson-video-caption p")?.textContent).not.toContain("Всего два.");
    expect(container.querySelector(".lesson-video-art .authored-fruit-model")?.getAttribute("aria-label")).toContain("4 яблока");

    await render(<AuthoredTaskView task={authoredFruitTask} progress={{ work: {}, hints: 0 }} onChange={vi.fn()} />);
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Яблоко ответа 1"]')?.click());
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Яблоко ответа 2"]')?.click());
    await click("Проверить");
    expect(container.querySelector(".authored-feedback-mascot")?.getAttribute("src")).toContain("math-cat.webp");
  });

  it("plays, pauses, replays and advances the animated explanation before continuing", async () => {
    const onContinue = vi.fn();
    await render(<LessonVideoPlayer slot={getLessonSlot(1, 2, 1)!} onContinue={onContinue} />);
    expect(container.textContent).toContain("История");
    await click("Воспроизвести");
    await click("Пауза");
    expect(container.textContent).toContain("Воспроизвести");
    await click("Повторить");
    for (let step = 0; step < 4; step += 1) await click("Следующий шаг");
    expect(container.textContent).toContain("Твой ход");
    await click("Завершить объяснение");
    await click("Перейти к заданиям");
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("resumes the authored lesson narration at its saved chapter", async () => {
    const onPositionChange = vi.fn();
    const onFinished = vi.fn();
    const onContinue = vi.fn();
    await render(<LessonVideoPlayer lesson={authoredLessonFixture} initialPosition={1} onPositionChange={onPositionChange} onFinished={onFinished} onContinue={onContinue} />);
    expect(container.textContent).toContain(authoredLesson.explanation.split("\n\n")[1]);
    await click("Следующий шаг");
    expect(onPositionChange).toHaveBeenCalledWith(2);
    await click("Следующий шаг");
    await click("Завершить объяснение");
    expect(onFinished).toHaveBeenCalledOnce();
    await click("Перейти к заданиям");
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("supports keyboard/touch placement, gentle retries and completion only after success", async () => {
    const complete = vi.fn();
    await render(<LessonExercises tasks={[task]} onComplete={complete} />);
    expect(button("Проверить").disabled).toBe(true);
    await click("Один");
    expect(button("Проверить").disabled).toBe(true);
    await click("Положи ответ сюда"); await click("Проверить");
    expect(container.textContent).toContain("Почти получилось!"); expect(complete).not.toHaveBeenCalled();
    await click("Два"); await click("Положи ответ сюда"); await click("Проверить");
    expect(container.textContent).toContain("Два яблока");
    await click("Завершить"); expect(complete).toHaveBeenCalledOnce();
  });

  it("draws the selected matching connection and still validates the answer", async () => {
    await render(<LessonExercises tasks={[task, { ...task, id: "match" }]} onComplete={vi.fn()} />);
    await click("Два"); await click("Положи ответ сюда"); await click("Проверить"); await click("Дальше");
    await click("Один"); expect(container.querySelector("svg line")).not.toBeNull();
    await click("Проверить"); expect(container.textContent).toContain("Почти получилось!");
    await click("Два"); await click("Проверить"); expect(button("Завершить")).toBeDefined();
  });

  it("prints lesson-specific practice with an optional answer key", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    await render(<ArbeitsblattGenerator slot={getLessonSlot(1, 2, 1)!} />);
    expect(container.querySelectorAll(".worksheet-question")).toHaveLength(7);
    expect(container.querySelector(".worksheet-key")).toBeNull();
    await act(async () => (container.querySelector('input[type="checkbox"]') as HTMLInputElement).click());
    expect(container.querySelector(".worksheet-key")).not.toBeNull();
    await click("Распечатать задания"); expect(print).toHaveBeenCalledOnce();
  });

  it("persists rewards once when a completed lesson is replayed", async () => {
    function Probe() { const progress = useProgress(); return <button onClick={() => progress.completeLesson("g1-t02-h1")}>Complete {progress.xp}</button>; }
    await render(<Probe />);
    await click("Complete"); await click("Complete");
    const saved = JSON.parse(localStorage.getItem("bilim-progress")!);
    expect(saved.xp).toBe(60); expect(saved.completed).toEqual(["g1-t02-h1"]);
  });

  it("keeps the authored adventure open and records a completed step", async () => {
    function Adventure() { const progress = useProgress(); return <><button onClick={() => progress.completeLesson("g1_l001")}>Finish first</button><LessonAdventureMap /></>; }
    await render(<Adventure />);
    expect(container.querySelector('a[href="/course/grade-1/g1_l002"]')).not.toBeNull();
    await click("Finish first");
    expect(container.querySelector('a[href="/course/grade-1/g1_l002"]')).not.toBeNull();
    expect(container.querySelector('a[href="/course/grade-1/g1_l001"]')?.textContent).toContain("★");
  });
});
