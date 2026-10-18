"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { t, useLanguage, useProgress } from "@/app/providers";

export function LessonRewards({ alreadyComplete }: { alreadyComplete: boolean }) {
  const { language } = useLanguage();
  const { xp, completed } = useProgress();
  useEffect(() => {
    if (alreadyComplete || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => { void confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 }, disableForReducedMotion: true }); }, 100);
    return () => { window.clearTimeout(timer); confetti.reset(); };
  }, [alreadyComplete]);
  return <div className="lesson-rewards" role="status"><span aria-label={t(language, "3 звезды за урок", "Сабак үчүн 3 жылдыз")}>⭐ ⭐ ⭐</span><p>{alreadyComplete ? t(language, "Отличное повторение! Награда за этот урок уже сохранена.", "Жакшы кайталадың! Бул сабактын сыйлыгы сакталган.") : t(language, "+60 XP · Урок пройден!", "+60 XP · Сабак бүттү!")}</p><small>{t(language, `Всего: ${xp} XP · ${completed.length * 3} звёзд`, `Жалпы: ${xp} XP · ${completed.length * 3} жылдыз`)}</small></div>;
}
