"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { t, useLanguage } from "@/app/providers";
import { FruitIllustration } from "@/components/fruit-illustration";
import { MathModelView } from "@/components/math-model";
import type { AuthoredLesson } from "@/lib/authored-types";
import type { LessonSlot } from "@/lib/curriculum";
import { lessonFruitForId, replaceCounterNouns } from "@/lib/lesson-fruit";
import { lessonMascotForId } from "@/lib/lesson-mascot";
import { getLessonGuide } from "@/lib/lesson-guide";

const SCENE_DURATION_MS = 30_000;

type CommonPlayerProps = {
  onContinue: () => void;
  initialPosition?: number;
  onPositionChange?: (position: number) => void;
  onFinished?: () => void;
};
type LessonVideoPlayerProps = CommonPlayerProps & (
  | { lesson: AuthoredLesson; slot?: never }
  | { slot: LessonSlot; lesson?: never }
);

export function LessonVideoPlayer({
  lesson,
  slot,
  initialPosition = 0,
  onPositionChange,
  onFinished,
  onContinue,
}: LessonVideoPlayerProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const guide = slot ? getLessonGuide(slot) : undefined;
  const fruit = lesson ? lessonFruitForId(lesson.id) : slot ? lessonFruitForId(`g1_l${String(slot.globalHour).padStart(3, "0")}`) : "apple";
  const mascot = lessonMascotForId(lesson?.id ?? `g1_l${String(slot?.globalHour ?? 1).padStart(3, "0")}`);
  const authoredCaptions = lesson?.steps.map((step) => replaceCounterNouns(step.text ?? step.instruction, fruit)) ?? [];
  const explanationCaptions = lesson?.explanation.split(/\n{2,}/).filter(Boolean).map((caption) => replaceCounterNouns(caption, fruit)) ?? [];
  const sceneCaptions = lesson
    ? authoredCaptions.length ? authoredCaptions : explanationCaptions.length ? explanationCaptions : [lesson.summary]
    : guide
      ? [guide.steps[0][language], guide.steps[1][language], guide.example[language], guide.steps[2][language], guide.prompt[language]]
      : [];
  const sceneLabels = language === "ru"
    ? ["История", "Смотрим", "Разбираем пример", "Пробуем способ", "Твой ход"]
    : ["Окуя", "Көрөбүз", "Мисалды карайбыз", "Ыкманы колдонобуз", "Сенин кезегиң"];
  const authoredSceneLabels = ["Знакомимся", "Считаем вместе", "Разбираем пример", "Пробуем сами"];
  const sceneTitles = sceneCaptions.map((_, index) => lesson
    ? authoredSceneLabels[index] ?? `Часть ${index + 1}`
    : sceneLabels[index] ?? `${t(language, "Шаг", "Кадам")} ${index + 1}`);
  const initialScene = Math.max(0, Math.min(sceneCaptions.length - 1, initialPosition));
  const [sceneIndex, setSceneIndex] = useState(initialScene);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const activePlayback = useRef(false);
  const reportedFinished = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSpeechAvailable("speechSynthesis" in window), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!playing || speechAvailable || finished) return;
    const timer = window.setTimeout(() => {
      if (sceneIndex === sceneCaptions.length - 1) {
        activePlayback.current = false;
        setPlaying(false);
        setFinished(true);
        if (!reportedFinished.current) {
          reportedFinished.current = true;
          onFinished?.();
        }
      } else {
        const next = sceneIndex + 1;
        setSceneIndex(next);
        onPositionChange?.(next);
      }
    }, SCENE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [finished, onFinished, onPositionChange, playing, sceneCaptions.length, sceneIndex, speechAvailable]);

  useEffect(() => () => {
    activePlayback.current = false;
    window.speechSynthesis?.cancel();
  }, []);

  const progress = sceneCaptions.length
    ? ((sceneIndex + (finished ? 1 : 0)) / sceneCaptions.length) * 100
    : 0;
  const title = lesson?.title ?? (slot ? language === "ru" ? slot.topic.titleRu : slot.topic.titleKy : "");

  function changeScene(index: number) {
    const next = Math.max(0, Math.min(sceneCaptions.length - 1, index));
    setSceneIndex(next);
    onPositionChange?.(next);
  }

  function finishPlayback() {
    activePlayback.current = false;
    setPlaying(false);
    setFinished(true);
    if (!reportedFinished.current) {
      reportedFinished.current = true;
      onFinished?.();
    }
  }

  function speakScene(index: number) {
    const utterance = new SpeechSynthesisUtterance(sceneCaptions[index]);
    utterance.lang = lesson || language === "ru" ? "ru-RU" : "ky-KG";
    utterance.rate = 0.9;
    utterance.onend = () => {
      if (!activePlayback.current) return;
      if (index >= sceneCaptions.length - 1) {
        finishPlayback();
      } else {
        changeScene(index + 1);
        speakScene(index + 1);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function startPlayback() {
    if (!sceneCaptions.length) return;
    if (finished) {
      replay();
      return;
    }
    activePlayback.current = true;
    setPlaying(true);
    if (speechAvailable) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      else {
        activePlayback.current = false;
        window.speechSynthesis.cancel();
        activePlayback.current = true;
        speakScene(sceneIndex);
      }
    }
  }

  function pausePlayback() {
    activePlayback.current = false;
    if (speechAvailable) window.speechSynthesis.pause();
    setPlaying(false);
  }

  function replay() {
    activePlayback.current = false;
    window.speechSynthesis?.cancel();
    activePlayback.current = true;
    setFinished(false);
    reportedFinished.current = false;
    changeScene(0);
    setPlaying(true);
    if (speechAvailable) speakScene(0);
  }

  function nextScene() {
    const wasPlaying = playing;
    activePlayback.current = false;
    window.speechSynthesis?.cancel();
    if (sceneIndex >= sceneCaptions.length - 1) {
      finishPlayback();
      return;
    }
    const next = sceneIndex + 1;
    changeScene(next);
    setFinished(false);
    if (wasPlaying && speechAvailable) {
      activePlayback.current = true;
      speakScene(next);
    }
  }

  function seekScene(index: number) {
    activePlayback.current = false;
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setFinished(false);
    changeScene(index);
  }

  const authoredStep = lesson?.steps[Math.min(sceneIndex, lesson.steps.length - 1)];
  const authoredModel = authoredStep?.objects.find((object) => object.zone === "demonstration" && object.state.renderer);

  return (
    <section className="lesson-video-player" aria-label={t(language, "Анимированное объяснение", "Анимациялык түшүндүрмө")}>
      <div className="lesson-video-heading">
        <div>
          <span className="kicker">{t(language, "Анимированное объяснение · цель 2–3 минуты", "Анимациялык түшүндүрмө · максат 2–3 мүнөт")}</span>
          <h1>{title}</h1>
        </div>
        <span className="lesson-video-duration">2–3 мин</span>
      </div>

      <div
        className="lesson-video-stage"
        data-lesson-mascot={mascot.name}
        style={{ "--lesson-mascot-image": `url("${mascot.src}")` } as React.CSSProperties}
      >
        <div className="lesson-video-mascots" aria-hidden="true">
          <span className="lesson-video-mascot">🐿️</span>
          <span className="lesson-video-mascot">🦊</span>
        </div>
        <motion.div
          className="lesson-video-art"
          key={`visual-${sceneIndex}`}
          initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          aria-hidden="true"
        >
          {lesson && authoredModel
            ? <MathModelView model={authoredModel.state} label={replaceCounterNouns(authoredModel.label, fruit)} fruit={fruit} />
            : guide?.fruitGroups
              ? <FruitIllustration groups={guide.fruitGroups} language={language} />
              : <div className="lesson-guide-visual">{guide?.visual ?? "🧮"}</div>}
        </motion.div>
        <div className="lesson-video-caption" aria-live="polite" aria-atomic="true">
          <span>{sceneTitles[sceneIndex]}</span>
          <motion.p
            key={`caption-${sceneIndex}-${language}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {sceneCaptions[sceneIndex]}
          </motion.p>
        </div>
      </div>

      <div className="lesson-video-timeline">
        <div className="lesson-video-track" role="progressbar" aria-label={t(language, "Ход объяснения", "Түшүндүрмөнүн жүрүшү")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="lesson-video-chapters" aria-label={t(language, "Шаги объяснения", "Түшүндүрмө кадамдары")}>
          {sceneTitles.map((sceneTitle, index) => (
            <button
              type="button"
              key={`${index}-${sceneTitle}`}
              className={index === sceneIndex ? "active" : ""}
              aria-current={index === sceneIndex ? "step" : undefined}
              onClick={() => seekScene(index)}
            >
              {index + 1}. {sceneTitle}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-video-controls">
        <button type="button" className="button button-ghost" onClick={replay}>
          {t(language, "Повторить", "Кайра көрүү")}
        </button>
        <button
          type="button"
          className="button button-primary"
          aria-pressed={playing}
          onClick={playing ? pausePlayback : startPlayback}
        >
          {playing
            ? t(language, "Пауза", "Тыныгуу")
            : finished
              ? t(language, "Сначала", "Башынан")
              : t(language, "Воспроизвести", "Көрүү")}
        </button>
        {sceneIndex < sceneCaptions.length - 1
          ? <button type="button" className="button button-dark" onClick={nextScene}>{t(language, "Следующий шаг", "Кийинки кадам")} →</button>
          : <button type="button" className="button button-dark" onClick={finished ? onContinue : nextScene}>{t(language, finished ? "Перейти к заданиям" : "Завершить объяснение", finished ? "Тапшырмаларга өтүү" : "Түшүндүрмөнү бүтүрүү")} →</button>}
      </div>
      <p className="lesson-video-note">
        {speechAvailable
          ? t(language, "Готового видеофайла и записи диктора нет. Воспроизведение использует голос устройства; чтение начинается только после нажатия кнопки.", "Даяр видеофайл жана диктордун жазуусу жок. Ойнотуу түзмөктүн үнүн колдонот; үн баскычты баскандан кийин гана башталат.")
          : t(language, "Готового видеофайла и записи диктора нет. Можно читать анимированные подписи и переходить по шагам.", "Даяр видеофайл жана диктордун жазуусу жок. Анимациялык жазууларды окуп, кадамдарды тандасаң болот.")}
      </p>
    </section>
  );
}
