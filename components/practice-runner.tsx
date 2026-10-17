"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";
import type { PracticeTask } from "@/lib/practice";
import type { TopicFamily } from "@/lib/curriculum";
import { TutorChat } from "@/components/tutor-chat";

type TutorContext = {
  grade: number;
  topic: string;
  objective: string;
  topicFamily: TopicFamily;
};

export function PracticeRunner({ tasks, onComplete, startOffset = 0, totalCount, tutorContext }: { tasks: PracticeTask[]; onComplete: () => void; startOffset?: number; totalCount?: number; tutorContext: TutorContext }) {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [showHint, setShowHint] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const task = tasks[index];
  const fullCount = totalCount ?? tasks.length;
  const displayIndex = startOffset + index + 1;
  const correct = answer.trim().toLocaleLowerCase() === task.answer.toLocaleLowerCase();
  const selectedLabel = useMemo(() => task.options?.find((item) => item.value === answer), [answer, task.options]);
  const feedbackText = status === "correct"
    ? task.explanation[language]
    : t(language, `Выбрано: ${selectedLabel?.ru ?? answer}. ${task.hint.ru}`, `Тандалды: ${selectedLabel?.ky ?? answer}. ${task.hint.ky}`);
  const largeFigure = ["shapes", "geometry", "sorting", "symmetry"].includes(tutorContext.topicFamily);

  function check() {
    if (!answer.trim()) return;
    setStatus(correct ? "correct" : "incorrect");
  }

  function next() {
    if (status !== "correct") return;
    if (index === tasks.length - 1) {
      onComplete();
      return;
    }
    setIndex((value) => value + 1);
    setAnswer("");
    setStatus("idle");
    setShowHint(false);
    setShowTutor(false);
  }

  return (
    <div className="practice-runner">
      <div className="task-topline">
        <span>{t(language, `Задание ${displayIndex} из ${fullCount}`, `${fullCount} тапшырманын ${displayIndex}-тапшырмасы`)}</span>
        <div className="task-dots" aria-hidden="true">{Array.from({ length: fullCount }, (_, dot) => <i className={dot < displayIndex ? "filled" : ""} key={dot}/>)}</div>
      </div>
      <div className="task-card" key={task.id}>
        {task.visual && (
          <div className={`task-visual ${largeFigure ? "large-figures" : ""}`} aria-hidden="true">
            {task.visual.split("\n").map((line, lineIndex) => (
              <div className="task-visual-line" key={`${lineIndex}-${line}`}>
                {Array.from(line).map((symbol, symbolIndex) => (
                  <span
                    className="task-visual-symbol"
                    key={`${symbolIndex}-${symbol}`}
                    style={{ animationDelay: `${(symbolIndex % 10) * 55}ms` }}
                  >
                    {symbol === " " ? "\u00a0" : symbol}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        <h2>{task.prompt[language]}</h2>
        {task.kind === "choice" && task.options ? (
          <div className="answer-grid">
            {task.options.map((item) => (
              <button
                className={`answer-option ${answer === item.value ? "selected" : ""} ${status !== "idle" && item.value === task.answer ? "is-correct" : ""} ${status === "incorrect" && answer === item.value ? "is-wrong" : ""}`}
                disabled={status === "correct"}
                key={item.value}
                onClick={() => { setAnswer(item.value); setStatus("idle"); }}
                type="button"
              >
                <span className="answer-radio">{answer === item.value ? <i/> : null}</span>
                {item[language]}
              </button>
            ))}
          </div>
        ) : (
          <label className="number-answer">
            <span>{t(language, "Твой ответ", "Сенин жообуң")}</span>
            <input
              aria-label={t(language, "Введите число", "Санды киргиз")}
              disabled={status === "correct"}
              inputMode="numeric"
              onChange={(event) => { setAnswer(event.target.value.replace(/[^0-9-]/g, "")); setStatus("idle"); }}
              placeholder="?"
              value={answer}
            />
          </label>
        )}
        {showHint && status === "idle" && <div className="hint-panel"><Icon name="sparkle" size={18}/><div><p>{task.hint[language]}</p></div></div>}
        {status !== "idle" && (
          <div className={`feedback-panel ${status}`} role="status">
            <span className="feedback-icon">{status === "correct" ? <Icon name="check" size={22}/> : "↻"}</span>
            <div>
              <strong>{status === "correct" ? t(language, "Верно!", "Туура!") : t(language, "Пока не так", "Азырынча туура эмес")}</strong>
              <p>{feedbackText}</p>
            </div>
          </div>
        )}
        <div className="task-actions">
          <div className="task-help-actions">
            <button className="hint-button" disabled={showHint || status === "correct"} onClick={() => setShowHint(true)} type="button"><Icon name="sparkle" size={17}/>{t(language, "Подсказка", "Ишара")}</button>
            <button
              aria-controls="task-tutor-chat"
              aria-expanded={showTutor}
              className="hint-button tutor-toggle"
              onClick={() => setShowTutor((value) => !value)}
              type="button"
            >
              <Icon name="sparkle" size={17}/>
              {showTutor
                ? t(language, "Скрыть помощника", "Жардамчыны жашыруу")
                : t(language, "Спросить помощника", "Жардамчыдан сура")}
            </button>
          </div>
          {status === "correct" ? (
            <button className="button button-primary" onClick={next} type="button">{index === tasks.length - 1 ? t(language, "Завершить", "Бүтүрүү") : t(language, "Дальше", "Андан ары")}<Icon name="arrow" size={18}/></button>
          ) : (
            <button className="button button-dark" disabled={!answer.trim()} onClick={check} type="button">{status === "incorrect" ? t(language, "Проверить ещё раз", "Кайра текшерүү") : t(language, "Проверить", "Текшерүү")}</button>
          )}
        </div>
        {showTutor && (
          <div className="task-tutor-panel" id="task-tutor-chat">
            <TutorChat
              grade={tutorContext.grade}
              language={language}
              objective={tutorContext.objective}
              topic={tutorContext.topic}
            />
          </div>
        )}
      </div>
    </div>
  );
}
