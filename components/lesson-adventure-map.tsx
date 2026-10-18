"use client";

import Link from "next/link";
import { t, useLanguage, useProgress } from "@/app/providers";
import { activeLessonSlots, lessonHref } from "@/lib/course-navigation";

export function LessonAdventureMap() {
  const { language } = useLanguage();
  const { completed } = useProgress();
  const slots = activeLessonSlots(1);
  const firstIncomplete = slots.findIndex((slot) => !completed.includes(slot.id));
  const current = firstIncomplete < 0 ? slots.length - 1 : firstIncomplete;
  const start = Math.min(Math.max(0, current - 2), Math.max(0, slots.length - 8));
  return <section className="dashboard-section">
    <div className="dashboard-section-heading"><div><span className="kicker">{t(language, "1-й класс", "1-класс")}</span><h2>{t(language, "Карта приключений", "Укмуштуу окуялар картасы")}</h2></div></div>
    <p>{t(language, "Продолжай свой путь или выбери другой урок. Все знания открыты для тебя.", "Жолуңду улант же башка сабакты танда. Бардык сабактар сага ачык.")}</p>
    <ol className="lesson-adventure-map">{slots.slice(start, start + 8).map((slot, offset) => {
      const index = start + offset;
      const complete = completed.includes(slot.id);
      const label = `${slot.globalHour}. ${language === "ru" ? slot.topic.titleRu : slot.topic.titleKy}`;
      return <li className={complete ? "earned" : "available"} key={slot.id}><Link href={lessonHref(slot)} aria-label={label} aria-current={index === current ? "step" : undefined}><strong>{complete ? "★" : slot.globalHour}</strong><span>{complete ? t(language, "Пройдено", "Бүттү") : t(language, "Начать", "Баштоо")}</span></Link></li>;
    })}</ol>
  </section>;
}
