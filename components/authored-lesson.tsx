"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/app/providers";
import { AuthoredTaskView, SpeakButton } from "@/components/authored-task";
import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";
import { LessonRewards } from "@/components/LessonRewards";
import type { AuthoredLesson, AuthoredProgress, TaskProgress } from "@/lib/authored-types";
import { lessonFruitForId, replaceCounterNouns } from "@/lib/lesson-fruit";

const empty: AuthoredProgress = { tab: "lesson", taskIndex: 0, tasks: {}, steps: [], homeworkDone: [], adultConfirmed: false, videoPosition: 0, videoSeen: false };
const emptyTask: TaskProgress = { work: {}, hints: 0 };

function taskCountLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "заданий"
    : lastDigit === 1
      ? "задание"
      : lastDigit >= 2 && lastDigit <= 4
        ? "задания"
        : "заданий";
  return `${count} ${noun}`;
}

export function AuthoredLessonPage({ lesson }: { lesson: AuthoredLesson }) {
  const profile = useProgress();
  const [state, setState] = useState<AuthoredProgress>(empty);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const key = `${lesson.courseId}:${lesson.id}:local`;
  const totalAssessmentTasks = lesson.assessment.length;
  const awarded = useRef(false);
  const [completedOnEntry, setCompletedOnEntry] = useState<boolean | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const saved = JSON.parse(raw) as AuthoredProgress;
          if (["lesson", "test", "homework"].includes(saved.tab) && saved.tasks && Array.isArray(saved.steps) && Array.isArray(saved.homeworkDone)) setState({
            ...empty,
            ...saved,
            taskIndex: Math.max(0, Math.min(Math.max(0, totalAssessmentTasks - 1), Number(saved.taskIndex) || 0)),
            videoPosition: Number.isInteger(saved.videoPosition) && saved.videoPosition >= 0 ? saved.videoPosition : 0,
            videoSeen: saved.videoSeen === true,
          });
        }
      } catch { setStorageError(true); }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [key, totalAssessmentTasks]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { const timer = setTimeout(() => setStorageError(true), 0); return () => clearTimeout(timer); }
  }, [key, ready, state]);
  const independent = lesson.assessment.filter((task) => state.tasks[task.id]?.first?.correct && !state.tasks[task.id]?.first?.assisted).length;
  const attempted = lesson.assessment.filter((task) => state.tasks[task.id]?.first).length;
  const solved = lesson.assessment.filter((task) => state.tasks[task.id]?.latest?.correct).length;
  const masteryThreshold = Math.ceil(lesson.threshold * totalAssessmentTasks / 10);
  const completeLesson = profile.completeLesson;
  const setLastLesson = profile.setLastLesson;
  const lessonFruit = lessonFruitForId(lesson.id);
  useEffect(() => {
    if (!profile.ready || completedOnEntry !== null) return;
    const timer = window.setTimeout(() => setCompletedOnEntry(profile.isComplete(lesson.id)), 0);
    return () => window.clearTimeout(timer);
  }, [profile, completedOnEntry, lesson.id]);
  useEffect(() => { if (profile.ready) setLastLesson(lesson.id); }, [profile.ready, setLastLesson, lesson.id]);
  useEffect(() => {
    if (!ready || !profile.ready || awarded.current || totalAssessmentTasks === 0 || attempted !== totalAssessmentTasks) return;
    awarded.current = true;
    completeLesson(lesson.id);
  }, [ready, profile.ready, attempted, totalAssessmentTasks, lesson.id, completeLesson]);
  function taskChange(id: string, progress: TaskProgress) { setState((current) => ({ ...current, tasks: { ...current.tasks, [id]: progress } })); }
  const assessmentTask = lesson.assessment[state.taskIndex];
  const pdf = `/api/homework/${lesson.id}`;

  return <div className={`page-surface authored-course ${largeText ? "large-text" : ""}`} lang="ru"><div className="shell">
    <div className="authored-topline"><Link href="/grades/1">← Все уроки</Link><span>1 класс · Урок {lesson.order} из 85</span><button type="button" className="hint-button" aria-pressed={largeText} onClick={() => setLargeText(!largeText)}>Аа {largeText ? "Обычный текст" : "Крупнее"}</button></div>
    <header className="authored-header"><span className="kicker">Мастерская открытий</span><h1>{lesson.title}</h1><p>{lesson.topic}</p></header>
    <nav className="authored-tabs" aria-label="Разделы урока">{([['lesson','Урок'],['test',`Тест · ${taskCountLabel(totalAssessmentTasks)}`],['homework','Д/З']] as const).map(([tab,label]) => <button key={tab} type="button" aria-current={state.tab === tab ? "page" : undefined} onClick={() => setState((current) => ({ ...current, tab }))}>{label}</button>)}</nav>
    {storageError && <p role="status">Браузер не разрешил сохранить прогресс. Задания доступны, но после закрытия страницы результаты могут пропасть.</p>}
    {!ready ? <p role="status">Открываем урок…</p> : <div className="authored-content">
      {state.tab === "lesson" && <>
        <LessonVideoPlayer
          lesson={lesson}
          initialPosition={state.videoPosition}
          onPositionChange={(videoPosition) => setState((current) => ({ ...current, videoPosition }))}
          onFinished={() => setState((current) => ({ ...current, videoSeen: true }))}
          onContinue={() => document.getElementById("authored-lesson-steps")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
        <section id="authored-lesson-steps"><h2>Делаем вместе</h2>{lesson.steps.map((step, index) => <details className="authored-step" key={step.id} open={index === 0 ? true : undefined}><summary>{index + 1}. {step.title ?? "Разобранный пример"}</summary><p>{replaceCounterNouns(step.text ?? "", lessonFruit)}</p><AuthoredTaskView task={step} progress={state.tasks[step.id] ?? emptyTask} onChange={(value) => taskChange(step.id, value)} /><details><summary>Показать разбор</summary><p>{replaceCounterNouns(step.explanation, lessonFruit)}</p></details></details>)}</section>
        <button className="button button-primary" type="button" onClick={() => setState((current) => ({ ...current, tab: "test" }))}>Начать тест →</button>
      </>}
      {state.tab === "test" && <>
        <div className="authored-assessment-header"><div><h2>Проверочный тест</h2><p>Без таймера. Можно сделать перерыв и вернуться.</p></div><span>{attempted} / {totalAssessmentTasks} выполнено</span></div>
        <nav className="authored-task-nav" aria-label="Задания теста">{lesson.assessment.map((task, index) => <button type="button" key={task.id} aria-label={`Задание ${index + 1}${state.tasks[task.id]?.first ? ", есть ответ" : ""}`} aria-current={state.taskIndex === index ? "step" : undefined} className={state.tasks[task.id]?.latest?.correct ? "answered" : ""} onClick={() => setState((current) => ({ ...current, taskIndex: index }))}>{index + 1}</button>)}</nav>
        <AuthoredTaskView key={assessmentTask.id} task={assessmentTask} progress={state.tasks[assessmentTask.id] ?? emptyTask} onChange={(value) => taskChange(assessmentTask.id, value)} />
        <div className="authored-actions"><button className="button button-ghost" type="button" disabled={state.taskIndex === 0} onClick={() => setState((current) => ({ ...current, taskIndex: current.taskIndex - 1 }))}>← Назад</button><button className="button button-primary" type="button" disabled={state.taskIndex >= totalAssessmentTasks - 1} onClick={() => setState((current) => ({ ...current, taskIndex: current.taskIndex + 1 }))}>Дальше →</button></div>
        {attempted === totalAssessmentTasks && <section className="authored-result" role="status"><span aria-hidden="true">★</span><h2>Ты попробовал все задания!</h2><p>Самостоятельно с первой попытки: {independent} из {totalAssessmentTasks}. Сейчас решено: {solved} из {totalAssessmentTasks}.</p><p>{independent >= masteryThreshold ? "Отличная работа! Прогресс сохранён: 3 звезды и 60 XP за первое прохождение." : "Урок завершён — награда сохранена. Если захочешь, можно вернуться к заданиям и потренироваться ещё."}</p>{completedOnEntry !== null && <LessonRewards alreadyComplete={completedOnEntry} />}<p>{lesson.reflection.question}</p><div className="authored-choice-row">{lesson.reflection.options.map((option) => <button type="button" key={option} aria-pressed={state.reflection === option} onClick={() => setState((current) => ({ ...current, reflection: option }))}>{option}</button>)}</div></section>}
      </>}
      {state.tab === "homework" && <>
        <section className="authored-homework-header"><h2>Тренируемся дома</h2><p>{replaceCounterNouns(lesson.parentNote, lessonFruit)}</p><div className="authored-actions"><a className="button button-primary" href={`${pdf}?download=1`}>↓ Сохранить PDF</a><a className="button button-ghost" href={pdf} target="_blank" rel="noreferrer">Открыть для печати ↗</a></div><p className="authored-note">Печатайте в масштабе 100%. Ответы находятся в отдельном разделе для взрослых.</p></section>
        {lesson.homework.map((task, index) => "offline" in task ? <section className="authored-task" key={task.id}><h3>{index + 1}. Попробуй с предметами</h3><p>{task.instruction}</p><SpeakButton text={task.instruction} /><label className="authored-check"><input type="checkbox" checked={state.homeworkDone.includes(task.id)} onChange={(event) => setState((current) => ({ ...current, homeworkDone: event.target.checked ? [...current.homeworkDone, task.id] : current.homeworkDone.filter((id) => id !== task.id) }))} />Сделано</label><label className="authored-check"><input type="checkbox" checked={state.adultConfirmed} onChange={(event) => setState((current) => ({ ...current, adultConfirmed: event.target.checked }))} />Взрослый посмотрел</label></section> : <AuthoredTaskView key={task.id} task={task} progress={state.tasks[task.id] ?? emptyTask} onChange={(value) => taskChange(task.id, value)} />)}
        <Link className="hint-button" href={`/parents/lessons/${lesson.id}`}>Для родителей: ответы и пояснения →</Link>
      </>}
    </div>}
    <footer className="authored-footer"><span>Прогресс сохраняется на этом устройстве · Материал на русском</span>{lesson.nextId && <Link href={`/course/grade-1/${lesson.nextId}`}>Следующий урок →</Link>}</footer>
  </div></div>;
}
