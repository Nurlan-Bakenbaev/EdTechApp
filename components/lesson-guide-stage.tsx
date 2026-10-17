"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { FruitIllustration } from "@/components/fruit-illustration";
import { useLanguage } from "@/app/providers";
import type { LessonSlot } from "@/lib/curriculum";
import { getLessonGuide } from "@/lib/lesson-guide";

export function LessonGuideStage({
  slot,
  onContinue,
}: {
  slot: LessonSlot;
  onContinue: () => void;
}) {
  const { language } = useLanguage();
  const guide = getLessonGuide(slot);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [teachingStep, setTeachingStep] = useState(0);
  const isCorrect = selected === guide.answer;
  const isKyrgyz = language === "ky";
  const stepTitles = isKyrgyz
    ? ["Көр", "Чогуу жасайбыз", "Сенин кезегиң"]
    : ["Смотри", "Делаем вместе", "Твой ход"];

  function renderVisual(isQuestion = false) {
    if (guide.fruitGroups) {
      return <FruitIllustration groups={guide.fruitGroups} language={language} />;
    }

    if (slot.topic.family === "spatial") {
      const vertical = isQuestion && /над|above/i.test(guide.prompt[language]);
      return (
        <div className={`lesson-guide-visual is-spatial-model ${vertical ? "is-vertical" : ""}`} aria-hidden="true">
          <span className="spatial-ball">⚽</span>
          <span className="spatial-box">📦</span>
        </div>
      );
    }

    return (
      <div className={`lesson-guide-visual ${guide.visual.length > 8 ? "is-compact" : ""}`} aria-hidden="true">
        {guide.visual}
      </div>
    );
  }

  function checkAnswer() {
    if (!selected) return;
    setChecked(true);
  }

  return (
    <section className="lesson-guide" aria-labelledby="lesson-guide-title">
      <div className="lesson-guide-header">
        <div>
          <span className="kicker">{teachingStep + 1}/3 · {stepTitles[teachingStep]}</span>
          <h1 id="lesson-guide-title">{stepTitles[teachingStep]}</h1>
          <p>{isKyrgyz ? ["Кунт коюп кара.", "Мисалды чогуу карайлы.", "Жоопту танда."][teachingStep] : ["Посмотри внимательно.", "Рассмотри пример.", "Выбери ответ."][teachingStep]}</p>
        </div>
        <div className="lesson-guide-progress" aria-label={`${teachingStep + 1} / 3`}>
          {[0, 1, 2].map((step) => <span className={step <= teachingStep ? "active" : ""} key={step} />)}
        </div>
      </div>

      <div className="lesson-guide-body">
        {teachingStep < 2 ? (
          <div className="lesson-guide-teach" key={teachingStep}>
            {renderVisual()}
            <p>{teachingStep === 0 ? guide.steps[0][language] : guide.example[language]}</p>
          </div>
        ) : (
          <div className="lesson-guide-try">
            {renderVisual(true)}
            <h2>{guide.prompt[language]}</h2>
            <div className="lesson-guide-options" role="group" aria-label={guide.prompt[language]}>
              {guide.options.map((option) => (
                <button
                  aria-pressed={selected === option.value}
                  className={[
                    "lesson-guide-option",
                    selected === option.value ? "selected" : "",
                    checked && option.value === guide.answer ? "correct" : "",
                    checked && selected === option.value && !isCorrect ? "incorrect" : "",
                  ].filter(Boolean).join(" ")}
                  key={option.value}
                  onClick={() => {
                    setSelected(option.value);
                    setChecked(false);
                  }}
                  type="button"
                >
                  {option.label[language]}
                </button>
              ))}
            </div>
          </div>
        )}

        {teachingStep === 2 && checked && (
            <div className={`lesson-guide-feedback ${isCorrect ? "correct" : "incorrect"}`} role="status">
              <strong>
                {isCorrect
                  ? isKyrgyz ? "Туура!" : "Верно!"
                  : isKyrgyz ? "Кел, дагы бир жолу аракет кылалы." : "Попробуй ещё раз."}
              </strong>
              <p>{isCorrect
                ? guide.feedback[language]
                : isKyrgyz ? "Сүрөттү кайра карап, башка жоопту танда." : "Посмотри на рисунок ещё раз и выбери другой ответ."}</p>
            </div>
        )}

        <div className="lesson-guide-actions">
          {teachingStep === 0 && (
            <button className="button button-primary" onClick={() => setTeachingStep(1)} type="button">
              {isKyrgyz ? "Кийинки" : "Дальше"}<Icon name="arrow" size={18} />
            </button>
          )}
          {teachingStep === 1 && (
            <>
              <button className="button button-ghost" onClick={() => setTeachingStep(0)} type="button">
                {isKyrgyz ? "Артка" : "Назад"}
              </button>
              <button className="button button-primary" onClick={() => setTeachingStep(2)} type="button">
                {isKyrgyz ? "Мен аракет кылам" : "Я попробую"}<Icon name="arrow" size={18} />
              </button>
            </>
          )}
          {teachingStep === 2 && (!checked || !isCorrect ? (
            <button className="button button-dark" disabled={!selected} onClick={checkAnswer} type="button">
              <Icon name="check" size={18}/>{isKyrgyz ? "Текшерүү" : "Проверить"}
            </button>
          ) : (
            <button className="button button-primary" onClick={onContinue} type="button">
              {isKyrgyz
                ? slot.topic.family === "spatial" ? "Талаага өтүү" : "Тапшырмаларга өтүү"
                : slot.topic.family === "spatial" ? "Перейти к полю" : "Перейти к заданиям"}
              <Icon name="arrow" size={18} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
