"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { t, useLanguage, useProgress } from "@/app/providers";
import { formatLessonPoints } from "@/lib/lesson-points";

interface LessonRewardsProps {
  alreadyComplete: boolean;
  lessonPoints?: number;
  topicPoints?: number;
  totalLessonPoints?: number;
}

export function LessonRewards({ alreadyComplete, lessonPoints, topicPoints, totalLessonPoints }: LessonRewardsProps) {
  const { language } = useLanguage();
  const { xp, completed } = useProgress();
  useEffect(() => {
    if (alreadyComplete || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => { void confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, disableForReducedMotion: true }); }, 100);
    return () => { window.clearTimeout(timer); confetti.reset(); };
  }, [alreadyComplete]);
  const hasTopicPoints = lessonPoints !== undefined && topicPoints !== undefined && totalLessonPoints !== undefined;
  return <div className="lesson-rewards" role="status">
    <span aria-label={t(language, "3 звезды за урок", "Сабак үчүн 3 жылдыз")}>⭐ ⭐ ⭐</span>
    <p>{hasTopicPoints
      ? alreadyComplete
        ? t(language, "Награда за этот урок уже получена.", "Бул сабактын сыйлыгы алынган.")
        : t(language, `+${formatLessonPoints(lessonPoints ?? 0)} · Урок пройден!`, `+${lessonPoints} упай · Сабак бүттү!`)
      : alreadyComplete
        ? t(language, "Отличное повторение! Награда за этот урок уже сохранена.", "Жакшы кайталадың! Бул сабактын сыйлыгы сакталган.")
        : t(language, "+60 XP · Урок пройден!", "+60 XP · Сабак бүттү!")}</p>
    {hasTopicPoints
      ? <small>{t(language, `Тема: ${topicPoints}/100 баллов · Всего за темы: ${totalLessonPoints}`, `Тема: ${topicPoints}/100 упай · Темалар боюнча жалпысы: ${totalLessonPoints}`)}</small>
      : <small>{t(language, `Всего: ${xp} XP · ${completed.length * 3} звёзд`, `Жалпы: ${xp} XP · ${completed.length * 3} жылдыз`)}</small>}
  </div>;
}
