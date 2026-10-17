"use client";

import { useEffect, useMemo, useState } from "react";
import { t, useLanguage, useProgress, type LessonCheckpoint } from "@/app/providers";
import type { LessonSlot } from "@/lib/curriculum";
import {
  createSpatialMicrotest,
  getSpatialHint,
  homeworkPrompts,
  homeworkTargetSeconds,
  lessonPhases,
  validateMathAnswer,
  type SpatialRelation,
} from "@/lib/lesson-engine";

const relations: Array<{ value: SpatialRelation; ru: string; ky: string; icon: string }> = [
  { value: "left", ru: "Слева", ky: "Сол жагында", icon: "←" },
  { value: "right", ru: "Справа", ky: "Оң жагында", icon: "→" },
  { value: "above", ru: "Над", ky: "Үстүндө", icon: "↑" },
  { value: "below", ru: "Под", ky: "Астында", icon: "↓" },
];

const initialCheckpoint: LessonCheckpoint = {
  phase: "A",
  practiceIndex: 0,
  practiceFailures: 0,
  practiceSelection: "",
  practiceCorrect: false,
  testRound: 0,
  testIndex: 0,
  testAnswers: [],
  testSelection: "",
  homeworkDone: [],
};

function normalizeCheckpoint(value: LessonCheckpoint | undefined): LessonCheckpoint {
  if (!value) return initialCheckpoint;
  return {
    ...initialCheckpoint,
    ...value,
    practiceIndex: Number.isInteger(value.practiceIndex) && value.practiceIndex >= 0 ? value.practiceIndex : 0,
    practiceFailures: Number.isInteger(value.practiceFailures) && value.practiceFailures >= 0 ? value.practiceFailures : 0,
    testRound: Number.isInteger(value.testRound) && value.testRound >= 0 ? value.testRound : 0,
    testIndex: Number.isInteger(value.testIndex) && value.testIndex >= 0 && value.testIndex < 10 ? value.testIndex : 0,
    testAnswers: Array.isArray(value.testAnswers) ? value.testAnswers.filter((answer): answer is boolean => typeof answer === "boolean").slice(0, 10) : [],
    homeworkDone: Array.isArray(value.homeworkDone) ? value.homeworkDone.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < homeworkPrompts.length) : [],
  };
}

function playLessonSound(enabled: boolean, correct: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return;
  const context = new AudioContextConstructor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = correct ? 660 : 260;
  gain.gain.setValueAtTime(0.035, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.16);
  window.setTimeout(() => void context.close(), 250);
}

export function LessonEngine({ slot, onComplete }: { slot: LessonSlot; onComplete: () => void }) {
  const { language } = useLanguage();
  const progress = useProgress();
  const { ready, getLessonCheckpoint, saveLessonCheckpoint, completeLesson } = progress;
  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [hydrated, setHydrated] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const microtest = useMemo(() => createSpatialMicrotest(checkpoint.testRound), [checkpoint.testRound]);
  const question = microtest[checkpoint.testIndex];
  const currentRelation = relations[checkpoint.practiceIndex % relations.length];
  const lessonId = slot.id;

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      setCheckpoint(normalizeCheckpoint(getLessonCheckpoint(lessonId)));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [getLessonCheckpoint, lessonId, ready]);

  useEffect(() => {
    if (hydrated) saveLessonCheckpoint(lessonId, checkpoint);
  }, [checkpoint, hydrated, lessonId, saveLessonCheckpoint]);

  const phaseIndex = lessonPhases.findIndex((phase) => phase.id === checkpoint.phase);
  const phaseProgress = phaseIndex < 0 ? lessonPhases.length - 1 : phaseIndex;

  function changePhase(phase: LessonCheckpoint["phase"]) {
    setCheckpoint((current) => ({ ...current, phase }));
  }

  function selectPractice(value: string) {
    setCheckpoint((current) => ({ ...current, practiceSelection: value, practiceCorrect: false }));
  }

  function checkPractice() {
    const correct = validateMathAnswer({ kind: "spatial-position", expected: currentRelation.value }, checkpoint.practiceSelection);
    playLessonSound(soundEnabled, correct);
    if (correct) {
      setCheckpoint((current) => ({ ...current, practiceCorrect: true }));
      return;
    }
    setCheckpoint((current) => ({ ...current, practiceFailures: current.practiceFailures + 1 }));
  }

  function nextPractice() {
    if (!checkpoint.practiceCorrect) return;
    if (checkpoint.practiceIndex + 1 >= relations.length) {
      changePhase("D");
      return;
    }
    setCheckpoint((current) => ({
      ...current,
      practiceIndex: current.practiceIndex + 1,
      practiceFailures: 0,
      practiceSelection: "",
      practiceCorrect: false,
    }));
  }

  function startIndependentPractice() {
    setCheckpoint((current) => ({
      ...current,
      practiceIndex: current.practiceIndex + 1,
      practiceFailures: 0,
      practiceSelection: "",
      practiceCorrect: false,
    }));
  }

  function submitTestAnswer() {
    if (!checkpoint.testSelection || !question) return;
    const correct = validateMathAnswer(question.validator, checkpoint.testSelection);
    playLessonSound(soundEnabled, correct);
    const testAnswers = [...checkpoint.testAnswers, correct];
    if (checkpoint.testIndex < microtest.length - 1) {
      setCheckpoint((current) => ({
        ...current,
        testAnswers,
        testIndex: current.testIndex + 1,
        testSelection: "",
      }));
      return;
    }

    if (testAnswers.filter(Boolean).length >= 8) {
      completeLesson(lessonId);
      setCheckpoint((current) => ({ ...current, testAnswers, phase: "homework", testSelection: "" }));
      return;
    }
    setCheckpoint((current) => ({ ...current, testAnswers, phase: "result", testSelection: "" }));
  }

  function retryTest() {
    setCheckpoint((current) => ({
      ...current,
      phase: "D",
      testRound: current.testRound + 1,
      testIndex: 0,
      testAnswers: [],
      testSelection: "",
    }));
  }

  function toggleHomework(index: number) {
    setCheckpoint((current) => ({
      ...current,
      homeworkDone: current.homeworkDone.includes(index)
        ? current.homeworkDone.filter((item) => item !== index)
        : [...current.homeworkDone, index],
    }));
  }

  const phaseHeader = (
    <div className="engine-phase-header">
      <div>
        <span className="kicker">{t(language, `Фаза ${checkpoint.phase === "homework" || checkpoint.phase === "result" ? "D" : checkpoint.phase}`, `${checkpoint.phase === "homework" || checkpoint.phase === "result" ? "D" : checkpoint.phase}-фаза`)}</span>
        <div className="engine-phase-track" aria-label={t(language, `Фаза ${phaseProgress + 1} из 4`, `4 фазадан ${phaseProgress + 1}-фаза`)}>
          {lessonPhases.map((phase, index) => <i className={index <= phaseProgress ? "active" : ""} key={phase.id} />)}
        </div>
      </div>
      <button
        aria-pressed={soundEnabled}
        className="engine-sound-toggle"
        onClick={() => setSoundEnabled((enabled) => !enabled)}
        type="button"
      >
        {soundEnabled ? "🔊" : "🔈"} {t(language, soundEnabled ? "Звук включён" : "Включить звук", soundEnabled ? "Үн күйгүзүлдү" : "Үндү күйгүзүү")}
      </button>
    </div>
  );

  return (
    <section className="lesson-engine" aria-label={t(language, "Интерактивный урок", "Интерактивдүү сабак")}>
      {phaseHeader}
      <div className="engine-stage" key={checkpoint.phase}>
        {checkpoint.phase === "A" && (
          <>
            <span className="engine-time">{t(language, "Ориентир: 2 минуты", "Болжол менен: 2 мүнөт")}</span>
            <div className="engine-hook-scene" aria-label={t(language, "Мяч находится слева от коробки", "Топ кутунун сол жагында")}>
              <span className="engine-ball">⚽</span><span className="engine-box">📦</span>
            </div>
            <span className="kicker">{t(language, "Вопрос для Жылдыз", "Жылдызга суроо")}</span>
            <h1>{t(language, "Мяч потерялся. Где он относительно коробки?", "Топ адашып калды. Ал кутуга карата кайсы жерде?")}</h1>
            <p>{t(language, "Представь, что помогаешь Жылдыз найти его. Важно сначала выбрать предмет, относительно которого мы сравниваем положение.", "Жылдызга топту табууга жардам бер. Адегенде жайгашуусун кайсы буюмга салыштырарыбызды аныкта.")}</p>
            <button className="button button-primary" onClick={() => changePhase("B")} type="button">{t(language, "Начать разбираться", "Үйрөнүүнү баштоо")}<span aria-hidden="true">→</span></button>
          </>
        )}

        {checkpoint.phase === "B" && (
          <>
            <span className="engine-time">{t(language, "Ориентир: 4 минуты · предмет → схема → слово", "Болжол менен: 4 мүнөт · буюм → схема → сөз")}</span>
            <span className="kicker">{t(language, "Сначала предмет, затем схема", "Адегенде буюм, анан схема")}</span>
            <h1>{t(language, "Положение зависит от выбранного ориентира", "Жайгашуу тандалган багыттоочуга жараша болот")}</h1>
            <div className="engine-demonstration">
              <div className="engine-mini-scene"><span>⚽</span><b>📦</b></div>
              <p>{t(language, "Шаг 1 · Найди коробку — это предмет-ориентир.", "1-кадам · Кутуну тап — ал багыттоочу буюм.")}</p>
              <div className="engine-mini-scene reverse"><span>📦</span><b>⚽</b></div>
              <p>{t(language, "Шаг 2 · Если поменять, на какой предмет смотришь, «слева» и «справа» меняются местами. «Над» и «под» тоже описывают положение относительно ориентира.", "2-кадам · Кайсы буюмга караганыңды өзгөртсөң, «сол» жана «оң» алмашат. «Үстүндө» жана «астында» да багыттоочуга карата айтылат.")}</p>
            </div>
            <p className="engine-concept-note">{t(language, "Схема: сначала назови ориентир → затем сравни стороны → только потом ответь.", "Схема: адегенде багыттоочуну ата → анан тараптарды салыштыр → акырында жооп бер.")}</p>
            <button className="button button-primary" onClick={() => changePhase("C")} type="button">{t(language, "Теперь попробую", "Эми аракет кылам")}<span aria-hidden="true">→</span></button>
          </>
        )}

        {checkpoint.phase === "C" && (
          <>
            <span className="engine-time">{t(language, "Ориентир: 6 минут · 4 самостоятельных действия", "Болжол менен: 6 мүнөт · 4 өз алдынча аракет")}</span>
            <span className="kicker">{t(language, `Попытка ${Math.min(checkpoint.practiceIndex + 1, relations.length)} из ${relations.length}`, `${relations.length} аракеттин ${Math.min(checkpoint.practiceIndex + 1, relations.length)}-си`)}</span>
            <h1>{t(language, `Помести мяч ${currentRelation.ru.toLocaleLowerCase()} от коробки`, `Топту кутунун ${currentRelation.ky.toLocaleLowerCase()} жайгаштыр`)}</h1>
            <div className={`engine-spatial-board selected-${checkpoint.practiceSelection}`} aria-label={t(language, `Выбрано положение: ${relations.find((item) => item.value === checkpoint.practiceSelection)?.ru ?? "не выбрано"}`, `Тандалган орун: ${relations.find((item) => item.value === checkpoint.practiceSelection)?.ky ?? "тандалган жок"}`)}>
              <span className="engine-board-ball">⚽</span><span className="engine-board-box">📦</span>
            </div>
            <div className="engine-relation-options" role="group" aria-label={t(language, "Выбери положение мяча", "Топтун жайгашуусун танда")}>
              {relations.map((item) => (
                <button
                  aria-pressed={checkpoint.practiceSelection === item.value}
                  className={checkpoint.practiceSelection === item.value ? "selected" : ""}
                  key={item.value}
                  onClick={() => selectPractice(item.value)}
                  type="button"
                ><span aria-hidden="true">{item.icon}</span>{t(language, item.ru, item.ky)}</button>
              ))}
            </div>
            {checkpoint.practiceFailures > 0 && !checkpoint.practiceCorrect && (
              <div className="engine-hint" role="status">
                <strong>{t(language, `Подсказка ${Math.min(checkpoint.practiceFailures, 3)}`, `Ишара ${Math.min(checkpoint.practiceFailures, 3)}`)}</strong>
                <p>{getSpatialHint(Math.min(checkpoint.practiceFailures, 3) as 1 | 2 | 3, language)}</p>
                {checkpoint.practiceFailures >= 3 && <button className="engine-text-button" onClick={startIndependentPractice} type="button">{t(language, "Разобрать шаг и перейти к новому примеру", "Кадамды карап, жаңы мисалга өтүү")} →</button>}
              </div>
            )}
            {checkpoint.practiceCorrect && <p className="engine-correct" role="status">{t(language, "Верно: ты сравнил положение именно с коробкой.", "Туура: сен орунду кутуга салыштырдың.")}</p>}
            <div className="engine-actions">
              {checkpoint.practiceCorrect
                ? <button className="button button-primary" onClick={nextPractice} type="button">{checkpoint.practiceIndex + 1 >= relations.length ? t(language, "Перейти к тесту", "Тестке өтүү") : t(language, "Следующий пример", "Кийинки мисал")} →</button>
                : <button className="button button-primary" disabled={!checkpoint.practiceSelection} onClick={checkPractice} type="button">{t(language, "Проверить выбор", "Тандоону текшерүү")}</button>}
            </div>
          </>
        )}

        {checkpoint.phase === "D" && question && (
          <>
            <span className="engine-time">{t(language, "Ориентир: 8 минут · тест без подсказок", "Болжол менен: 8 мүнөт · ишарасыз тест")}</span>
            <div className="engine-test-heading"><span className="kicker">{t(language, "Самостоятельная проверка", "Өз алдынча текшерүү")}</span><strong>{checkpoint.testIndex + 1}/10</strong></div>
            <div className="engine-test-progress" aria-hidden="true"><i style={{ width: `${((checkpoint.testIndex + 1) / 10) * 100}%` }} /></div>
            <h1>{question.prompt[language]}</h1>
            <div className="engine-test-options" role="group" aria-label={question.prompt[language]}>
              {question.options.map((option) => (
                <button
                  aria-pressed={checkpoint.testSelection === option.value}
                  className={checkpoint.testSelection === option.value ? "selected" : ""}
                  key={option.value}
                  onClick={() => setCheckpoint((current) => ({ ...current, testSelection: option.value }))}
                  type="button"
                >{option.label[language]}</button>
              ))}
            </div>
            <p className="engine-test-note">{t(language, "Выбери ответ. Объяснение и результат появятся после всех 10 заданий.", "Жоопту танда. Түшүндүрмө жана жыйынтык 10 тапшырманын баарынан кийин көрсөтүлөт.")}</p>
            <button className="button button-primary" disabled={!checkpoint.testSelection} onClick={submitTestAnswer} type="button">{checkpoint.testIndex === 9 ? t(language, "Завершить тест", "Тестти бүтүрүү") : t(language, "Записать ответ", "Жоопту сактоо")} →</button>
          </>
        )}

        {checkpoint.phase === "result" && (
          <>
            <span className="kicker">{t(language, "Проверка завершена", "Текшерүү аяктады")}</span>
            <h1>{t(language, `${checkpoint.testAnswers.filter(Boolean).length} из 10 — давай закрепим тему`, `${checkpoint.testAnswers.filter(Boolean).length}/10 — теманы дагы бекемдейли`)}</h1>
            <p>{t(language, "Чтобы перейти к домашнему заданию, нужно не менее 8 верных ответов. Попробуй новый вариант: порядок задач и направление отношений изменятся.", "Үй тапшырмасына өтүү үчүн кеминде 8 туура жооп керек. Жаңы вариантты аткарып көр: тапшырмалардын ирети жана багыттар өзгөрөт.")}</p>
            <button className="button button-primary" onClick={retryTest} type="button">{t(language, "Пройти новый вариант", "Жаңы вариантты аткаруу")} →</button>
          </>
        )}

        {checkpoint.phase === "homework" && (
          <>
            <span className="engine-time">{t(language, `Домашнее задание · около ${homeworkTargetSeconds / 60} минут`, `Үй тапшырмасы · болжол менен ${homeworkTargetSeconds / 60} мүнөт`)}</span>
            <span className="kicker">{t(language, "Урок пройден", "Сабак аяктады")}</span>
            <h1>{t(language, "Теперь найди математику вокруг себя", "Эми математиканы айланаңдан тап")}</h1>
            <p>{t(language, "Это черновой учебный материал. Выполняй задания со взрослым; ничего не нужно фотографировать или отправлять.", "Бул — текшериле элек окуу материалы. Тапшырмаларды чоң киши менен аткар; сүрөткө тартып же жөнөтүүнүн кереги жок.")}</p>
            <div className="engine-homework-list">
              {homeworkPrompts.map((prompt, index) => (
                <label className="engine-homework-item" key={`${prompt.kind}-${index}`}>
                  <input checked={checkpoint.homeworkDone.includes(index)} onChange={() => toggleHomework(index)} type="checkbox" />
                  <span aria-hidden="true">{prompt.icon}</span>
                  <span>{prompt[language]}</span>
                </label>
              ))}
            </div>
            <p className="engine-draft-notice">{t(language, "Статус содержания: черновик. До публикации необходимы математическая, педагогическая и русско-кыргызская проверки.", "Материалдын статусу: долбоор. Жарыялоодон мурда математикалык, педагогикалык жана орусча-кыргызча текшерүү керек.")}</p>
            <button className="button button-primary" onClick={onComplete} type="button">{t(language, "Запомнил домашнее задание", "Үй тапшырмасын эске туттум")} ✓</button>
          </>
        )}
      </div>
    </section>
  );
}
