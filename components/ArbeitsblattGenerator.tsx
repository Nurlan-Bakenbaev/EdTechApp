"use client";

import { useState } from "react";
import { t, useLanguage } from "@/app/providers";
import { createPracticeTasks, topicObjective } from "@/lib/practice";
import type { LessonSlot } from "@/lib/curriculum";
import { FruitIllustration } from "@/components/fruit-illustration";

export function ArbeitsblattGenerator({ slot }: { slot: LessonSlot }) {
  const { language } = useLanguage();
  const [showAnswers, setShowAnswers] = useState(false);
  const tasks = createPracticeTasks(slot);
  return <section className="worksheet-tool">
    <div className="worksheet-controls"><h3>{t(language, "Практика на бумаге", "Кагаздагы көнүгүү")}</h3><p>{t(language, "Распечатайте или сохраните как PDF в окне печати.", "Басып чыгарыңыз же басып чыгаруу терезесинен PDF катары сактаңыз.")}</p><button className="button button-primary" type="button" onClick={() => window.print()}>{t(language, "Распечатать задания", "Тапшырмаларды басып чыгаруу")}</button><label><input type="checkbox" checked={showAnswers} onChange={(event) => setShowAnswers(event.target.checked)} /> {t(language, "Добавить ответы для родителей", "Ата-энелер үчүн жоопторду кошуу")}</label></div>
    <article className="lesson-worksheet">
      <header><strong>BILIM · {slot.grade} · {slot.globalHour}</strong><h1>{language === "ru" ? slot.topic.titleRu : slot.topic.titleKy}</h1><p>{topicObjective(slot.topic)[language]}</p><p>{t(language, "Имя: __________________ Дата: __________", "Аты: __________________ Күнү: __________")}</p></header>
      <h2>{t(language, "Обведи цифры и продолжи", "Цифраларды бастырып жаз жана улант")}</h2><div className="worksheet-trace">0 1 2 3 4 5 6 7 8 9</div><div className="worksheet-writing" />
      {tasks.map((task, index) => <section className="worksheet-question" key={task.id}><h3>{index + 1}. {task.prompt[language]}</h3>{task.fruitGroups ? <FruitIllustration groups={task.fruitGroups} language={language} /> : task.visual && <p className="worksheet-visual">{task.visual}</p>}{task.options && <p>{task.options.map((option) => `□ ${option[language]}`).join("     ")}</p>}<div className="worksheet-writing" /></section>)}
      <section className="worksheet-question"><h3>{t(language, "Разминка: реши примеры", "Көнүгүү: мисалдарды чыгар")}</h3><p>2 + 3 = ____　 5 − 2 = ____　 4 + 1 = ____　 6 − 3 = ____</p></section>
      {showAnswers && <section className="worksheet-key"><h2>{t(language, "Ответы для родителей", "Ата-энелер үчүн жооптор")}</h2>{tasks.map((task, index) => <p key={task.id}>{index + 1}. {task.options?.find((option) => option.value === task.answer)?.[language] ?? task.answer}</p>)}<p>{t(language, "Разминка", "Көнүгүү")}: 5, 3, 5, 3</p></section>}
    </article>
  </section>;
}
