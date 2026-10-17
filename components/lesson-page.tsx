"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage, useProgress } from "@/app/providers";
import { expandLessonSlots, type LessonSlot } from "@/lib/curriculum";
import { createPracticeTasks, topicObjective } from "@/lib/practice";
import { PracticeRunner } from "@/components/practice-runner";
import { LessonGuideStage } from "@/components/lesson-guide-stage";
import { SpatialStudio } from "@/components/spatial-studio";
import { LessonEngine } from "@/components/lesson-engine";

export function LessonPage({ slot }: { slot: LessonSlot }) {
  const { language } = useLanguage();
  const progress = useProgress();
  const setLastLesson = progress.setLastLesson;
  const specialSpatial = slot.grade === 1 && slot.topic.sourceOrder === 1;
  const usesUniversalEngine = specialSpatial && slot.part === 1;
  const [phase, setPhase] = useState<"intro" | "engine" | "learn" | "spatial" | "practice" | "done">(
    usesUniversalEngine ? "engine" : "intro",
  );
  const tasks = useMemo(() => createPracticeTasks(slot), [slot]);
  const objective = topicObjective(slot.topic);
  const allSlots = useMemo(() => expandLessonSlots(slot.grade), [slot.grade]);
  const currentIndex = allSlots.findIndex((item) => item.id === slot.id);
  const next = allSlots[currentIndex + 1];
  const nextHref = next ? `/lesson/${next.grade}/${next.topic.sourceOrder}/${next.part}` : `/grades/${slot.grade}`;
  useEffect(() => {
    setLastLesson(slot.id);
  }, [setLastLesson, slot.id]);

  useEffect(() => {
    if (phase !== "learn" && phase !== "engine") return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector(phase === "engine" ? ".lesson-engine" : ".lesson-guide")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  function finish() {
    progress.completeLesson(slot.id);
    setPhase("done");
  }

  return (
    <div className="lesson-surface">
      <div className="lesson-topbar">
        <div className="shell lesson-topbar-inner">
          <Link className="lesson-close" href={`/grades/${slot.grade}`} aria-label={t(language, "Закрыть урок", "Сабакты жабуу")}>×</Link>
          <div className="lesson-title-mini"><span>{t(language, `${slot.grade}-й класс · учебный час ${slot.globalHour}`, `${slot.grade}-класс · ${slot.globalHour}-окуу сааты`)}</span><strong>{language === "ru" ? slot.topic.titleRu : slot.topic.titleKy}</strong></div>
          <div className="lesson-overall"><span>{Math.round((slot.globalHour / allSlots.length) * 100)}%</span><div className="progress-track"><i style={{ width: `${(slot.globalHour / allSlots.length) * 100}%` }}/></div></div>
        </div>
      </div>
      <div className="shell lesson-layout">
        <div className="lesson-main">
          {phase === "intro" && (
            <section className="lesson-intro-card">
              <div className="lesson-intro-art"><span className="intro-symbol">{specialSpatial ? "↔" : slot.topic.family === "numbers" ? "123" : slot.topic.family === "geometry" ? "△" : "✦"}</span><span className="intro-part">{slot.part}/{slot.topic.hours}</span></div>
              <div className="lesson-intro-copy"><span className="kicker">{t(language, `Тема ${slot.topic.sourceNumber ?? "—"} · часть ${slot.part}`, `${slot.topic.sourceNumber ?? "—"}-тема · ${slot.part}-бөлүк`)}</span><h1>{language === "ru" ? slot.topic.titleRu : slot.topic.titleKy}</h1><p>{objective[language]}</p><div className="lesson-contract"><span><Icon name="clock" size={18}/>{t(language, "15–20 минут", "15–20 мүнөт")}</span><span><Icon name="book" size={18}/>{t(language, "Сначала разберём тему", "Адегенде теманы үйрөнөбүз")}</span><span><Icon name="sparkle" size={18}/>{t(language, "Потом задания", "Андан кийин тапшырмалар")}</span></div><button className="button button-primary large-button" onClick={() => setPhase("learn")} type="button">{t(language, "Разобраться в теме", "Теманы үйрөнүү")}<Icon name="arrow" size={19}/></button></div>
            </section>
          )}
          {phase === "engine" && <LessonEngine slot={slot} onComplete={() => setPhase("done")} />}
          {phase === "learn" && <LessonGuideStage slot={slot} onContinue={() => setPhase(specialSpatial ? "spatial" : "practice")} />}
          {phase === "spatial" && <SpatialStudio part={slot.part} onComplete={() => setPhase("practice")}/>} 
          {phase === "practice" && <PracticeRunner tasks={specialSpatial ? tasks.slice(1) : tasks} startOffset={specialSpatial ? 1 : 0} totalCount={6} onComplete={finish} tutorContext={{ grade: slot.grade, objective: objective[language], topic: language === "ru" ? slot.topic.titleRu : slot.topic.titleKy, topicFamily: slot.topic.family }}/>} 
          {phase === "done" && (
            <section className="lesson-complete-card">
              <div className="confetti" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
              <span className="complete-medal"><Icon name="star" size={34}/></span>
              <span className="kicker">{t(language, "Учебный час завершён", "Окуу сааты бүттү")}</span>
              <h1>{t(language, "Отличная работа!", "Абдан жакшы иштедиң!")}</h1>
              <p>{t(language, "Ты решил все задания и получил 60 звёзд. Ошибки были частью пути — именно так растёт понимание.", "Бардык тапшырмаларды аткарып, 60 жылдыз алдың. Каталар жолдун бир бөлүгү болду — түшүнүк ушинтип өсөт.")}</p>
              <div className="complete-stats"><div><strong>6/6</strong><span>{t(language, "заданий", "тапшырма")}</span></div><div><strong>+60</strong><span>{t(language, "звёзд", "жылдыз")}</span></div><div><strong><Icon name="check" size={22}/></strong><span>{t(language, "сохранено", "сакталды")}</span></div></div>
              <div className="complete-actions"><Link className="button button-primary" href={nextHref}>{next ? t(language, "Следующий час", "Кийинки саат") : t(language, "К программе", "Программага")}<Icon name="arrow" size={18}/></Link><Link className="button button-ghost" href="/dashboard">{t(language, "В кабинет", "Кабинетке")}</Link></div>
            </section>
          )}
        </div>
        <aside className="lesson-sidebar">
          <div className="lesson-info-card"><h3>{t(language, "Цель часа", "Сааттын максаты")}</h3><p>{objective[language]}</p><div className="lesson-source-badge"><Icon name="shield" size={17}/><span>{t(language, `Тема/часы: КТП, стр. ${slot.topic.sourcePage}`, `Тема/саат: КТП, ${slot.topic.sourcePage}-бет`)}</span></div><div className="lesson-draft-badge"><Icon name="book" size={17}/><span>{t(language, "Сценарий и задания: авторский черновик", "Сценарий жана тапшырмалар: автордук долбоор")}</span></div></div>
          <div className="lesson-part-nav"><h3>{t(language, "Части темы", "Теманын бөлүктөрү")}</h3><div>{Array.from({ length: slot.topic.hours }, (_, index) => <Link className={`${index + 1 === slot.part ? "current" : ""} ${progress.isComplete(`${slot.topic.id}-h${index + 1}`) ? "complete" : ""}`} href={`/lesson/${slot.grade}/${slot.topic.sourceOrder}/${index + 1}`} key={index}><span>{progress.isComplete(`${slot.topic.id}-h${index + 1}`) ? <Icon name="check" size={14}/> : index + 1}</span></Link>)}</div></div>
        </aside>
      </div>
    </div>
  );
}
