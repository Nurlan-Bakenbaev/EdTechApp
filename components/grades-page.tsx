"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage, useProgress } from "@/app/providers";
import { expandLessonSlots } from "@/lib/curriculum";

const planned = [
  { grade: 3, noteRu: "Два конфликтующих учебных трека", noteKy: "Эки карама-каршы окуу багыты" },
  { grade: 4, noteRu: "Детальный КТП отсутствует", noteKy: "Толук КТП жок" },
  { grade: 5, noteRu: "Переходный курс 5+6 требует подтверждения", noteKy: "5+6 өткөөл курсу ырастоону талап кылат" },
];

export function GradesPage() {
  const { language } = useLanguage();
  const progress = useProgress();
  return (
    <div className="page-surface">
      <div className="shell grades-shell">
        <header className="page-heading centered-heading">
          <span className="eyebrow compact"><span className="eyebrow-dot" />{t(language, "Учебные программы", "Окуу программалары")}</span>
          <h1>{t(language, "Выбери свой класс", "Өз классыңды танда")}</h1>
          <p>{t(language, "1-й и 2-й классы открыты полностью по тематическим строкам и часам предоставленных КТП.", "1–2-класстар берилген КТПдагы тематикалык саптар жана сааттар боюнча толук ачылды.")}</p>
        </header>
        <div className="grade-cards-grid">
          {[1, 2].map((grade) => {
            const slots = expandLessonSlots(grade as 1 | 2);
            const done = slots.filter((slot) => progress.completed.includes(slot.id)).length;
            return (
              <Link className={`grade-select-card available grade-${grade}`} href={`/grades/${grade}`} key={grade}>
                <div className="grade-select-header"><span className="giant-grade">{grade}</span><span className="status-pill live"><span/>{t(language, "Открыт", "Ачык")}</span></div>
                <h2>{t(language, `${grade}-й класс`, `${grade}-класс`)}</h2>
                <p>{grade === 1 ? t(language, "33 темы · 96 часов · 3 часа в неделю", "33 тема · 96 саат · жумасына 3 саат") : t(language, "25 строк · 132 часа · 4 часа в неделю", "25 сап · 132 саат · жумасына 4 саат")}</p>
                <div className="progress-track"><span style={{ width: `${Math.max(2, (done / slots.length) * 100)}%` }}/></div>
                <small>{t(language, `${done} из ${slots.length} часов завершено`, `${slots.length} сааттын ${done} сааты бүттү`)}</small>
                <span className="open-label">{t(language, "Открыть программу", "Программаны ачуу")} <Icon name="arrow" size={18}/></span>
              </Link>
            );
          })}
          {planned.map((item) => (
            <article className="grade-select-card planned" key={item.grade}>
              <div className="grade-select-header"><span className="giant-grade">{item.grade}</span><span className="status-pill"><Icon name="lock" size={13}/>{t(language, "В плане", "Планда")}</span></div>
              <h2>{t(language, `${item.grade}-й класс`, `${item.grade}-класс`)}</h2>
              <p>{t(language, item.noteRu, item.noteKy)}</p>
              <span className="source-needed">{t(language, "Не опубликован как готовый курс", "Даяр курс катары жарыяланган эмес")}</span>
            </article>
          ))}
        </div>
        <div className="translation-notice"><Icon name="shield" size={22}/><div><strong>{t(language, "Статус кыргызского текста", "Кыргызча тексттин статусу")}</strong><p>{t(language, "Кыргызские названия и задания — редакционный черновик. Перед публичным выпуском нужна проверка носителем языка и учителем математики.", "Кыргызча аталыштар жана тапшырмалар — редакциялык долбоор. Коомдук чыгарылышка чейин тил адиси жана математика мугалими текшериши керек.")}</p></div></div>
      </div>
    </div>
  );
}
