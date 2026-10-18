"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { t, useLanguage } from "@/app/providers";
import { FruitIllustration } from "@/components/fruit-illustration";
import type { PracticeTask } from "@/lib/practice";

export function LessonExercises({ tasks, onComplete }: { tasks: PracticeTask[]; onComplete: () => void }) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [placed, setPlaced] = useState(false);
  const [status, setStatus] = useState<"idle" | "hint" | "correct">("idle");
  const task = tasks[index];
  const choiceIndex = tasks.slice(0, index).filter((item) => item.options?.length).length;
  const mode = task.options ? (["drag", "match", "choice"] as const)[choiceIndex % 3] : "number";

  function choose(value: string) {
    if (status === "correct") return;
    setAnswer(value);
    setPlaced(mode !== "drag");
    setStatus("idle");
  }

  function next() {
    if (status !== "correct") return;
    if (index === tasks.length - 1) { onComplete(); return; }
    setIndex(index + 1);
    setAnswer(""); setPlaced(false); setStatus("idle");
  }

  return <section className="practice-runner" aria-label={t(language, "Упражнения", "Көнүгүүлөр")}>
    <div className="task-topline"><span>{index + 1} / {tasks.length}</span><progress value={index} max={tasks.length} /></div>
    <motion.div className="task-card" key={task.id} initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {task.fruitGroups ? <FruitIllustration groups={task.fruitGroups} language={language} /> : task.visual && <div className="lesson-guide-visual">{task.visual}</div>}
      <h2>{task.prompt[language]}</h2>
      <p>{mode === "drag" ? t(language, "Перетащи ответ в корзинку. Можно выбрать карточку и нажать на корзинку.", "Жоопту себетке сүйрө. Карточканы тандап, себетти бассаң да болот.") : mode === "match" ? t(language, "Соедини вопрос с правильным ответом: нажми на карточку.", "Суроону туура жооп менен туташтыр: карточканы бас.") : t(language, "Выбери или запиши ответ.", "Жоопту танда же жаз.")}</p>
      {task.options ? <div className={`lesson-answer-board ${mode}`}>
        {mode === "match" && <><div className="match-origin" aria-hidden="true">?</div><svg className="lesson-match-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{answer && <line x1="8" y1="50" x2="97" y2={((task.options.findIndex((option) => option.value === answer) + 0.5) / task.options.length) * 100} stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />}</svg></>}
        <div className="answer-grid">{task.options.map((option) => <button key={option.value} type="button" className={`answer-option ${answer === option.value ? "selected" : ""}`} aria-pressed={answer === option.value} disabled={status === "correct"} draggable={mode === "drag" && status !== "correct"} onDragStart={(event) => { event.dataTransfer.setData("text/plain", option.value); event.dataTransfer.effectAllowed = "move"; }} onClick={() => choose(option.value)}>{mode === "match" && answer === option.value && <span aria-hidden="true">● ━ </span>}{option[language]}</button>)}</div>
      </div> : <label className="number-answer"><span>{t(language, "Твой ответ", "Сенин жообуң")}</span><input inputMode="numeric" value={answer} disabled={status === "correct"} onChange={(event) => choose(event.target.value.replace(/[^0-9-]/g, ""))} /></label>}
      {mode === "drag" && <button className={`lesson-drop-zone ${placed ? "filled" : ""}`} type="button" disabled={status === "correct"} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
        event.preventDefault();
        if (status === "correct") return;
        const value = event.dataTransfer.getData("text/plain");
        if (!task.options?.some((option) => option.value === value)) return;
        setAnswer(value); setPlaced(true); setStatus("idle");
      }} onClick={() => { if (answer) setPlaced(true); }}>🧺 {placed ? task.options?.find((option) => option.value === answer)?.[language] : t(language, "Положи ответ сюда", "Жоопту бул жерге кой")}</button>}
      <div aria-live="polite">{status !== "idle" && <div className="hint-panel"><span aria-hidden="true">{status === "correct" ? "🌟" : "🦉"}</span><p>{status === "correct" ? task.explanation[language] : `${t(language, "Почти получилось! Попробуем ещё раз. ", "Аз калды! Дагы аракет кылалы. ")}${task.hint[language]}`}</p></div>}</div>
      <div className="task-actions"><button className="hint-button" type="button" disabled={status === "correct"} onClick={() => setStatus("hint")}>{t(language, "Подсказка", "Ишара")}</button>{status === "correct" ? <button className="button button-primary" type="button" onClick={next}>{index === tasks.length - 1 ? t(language, "Завершить", "Бүтүрүү") : t(language, "Дальше", "Андан ары")}</button> : <button className="button button-primary" type="button" disabled={!answer.trim() || (mode === "drag" && !placed)} onClick={() => setStatus(answer.trim().toLocaleLowerCase() === task.answer.toLocaleLowerCase() ? "correct" : "hint")}>{t(language, "Проверить", "Текшерүү")}</button>}</div>
    </motion.div>
  </section>;
}
