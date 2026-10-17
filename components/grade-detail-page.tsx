"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage, useProgress } from "@/app/providers";
import { curriculumByGrade, expandLessonSlots, totalHours, type CurriculumTopic } from "@/lib/curriculum";

function TopicCard({ topic, grade }: { topic: CurriculumTopic; grade: 1 | 2 }) {
  const { language } = useLanguage();
  const progress = useProgress();
  const [open, setOpen] = useState(topic.sourceOrder === 1);
  const lessons = Array.from({ length: topic.hours }, (_, index) => `${topic.id}-h${index + 1}`);
  const completeCount = lessons.filter((id) => progress.completed.includes(id)).length;

  return (
    <article className={open ? "topic-card open" : "topic-card"}>
      <button className="topic-summary" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="topic-number">{topic.sourceNumber ?? "—"}</span>
        <span className="topic-main">
          <span className="topic-meta">
            {topic.sourceNumber === null ? t(language, "Строка без номера в источнике", "Булакта номери жок сап") : t(language, `Тема ${topic.sourceNumber}`, `${topic.sourceNumber}-тема`)}
            <i>·</i>{t(language, `${topic.hours} ч.`, `${topic.hours} саат`)}
          </span>
          <strong>{language === "ru" ? topic.titleRu : topic.titleKy}</strong>
          <span className="topic-progress-label">{t(language, `${completeCount} из ${topic.hours} часов`, `${topic.hours} сааттын ${completeCount} сааты`)}</span>
        </span>
        <span className="topic-progress-circle" style={{ "--topic-progress": `${(completeCount / topic.hours) * 360}deg` } as React.CSSProperties}>{completeCount === topic.hours ? <Icon name="check" size={16}/> : `${completeCount}/${topic.hours}`}</span>
        <Icon className="topic-chevron" name="chevron" size={20}/>
      </button>
      {open && (
        <div className="topic-details">
          <div className="lesson-part-grid">
            {lessons.map((lessonId, index) => {
              const complete = progress.completed.includes(lessonId);
              return (
                <Link className={complete ? "lesson-part complete" : "lesson-part"} href={`/lesson/${grade}/${topic.sourceOrder}/${index + 1}`} key={lessonId}>
                  <span>{complete ? <Icon name="check" size={15}/> : index + 1}</span>
                  <div><strong>{t(language, `Учебный час ${index + 1}`, `${index + 1}-окуу сааты`)}</strong><small>{t(language, "6 проверяемых заданий", "6 текшерилүүчү тапшырма")}</small></div>
                  <Icon name="chevron" size={17}/>
                </Link>
              );
            })}
          </div>
          <div className="topic-source-row"><span>{t(language, `КТП, стр. ${topic.sourcePage}`, `КТП, ${topic.sourcePage}-бет`)}</span><span>{t(language, "Задания: авторский черновик", "Тапшырмалар: автордук долбоор")}</span></div>
        </div>
      )}
    </article>
  );
}

export function GradeDetailPage({ grade }: { grade: 1 | 2 }) {
  const { language } = useLanguage();
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const topics = curriculumByGrade[grade];
  const slots = expandLessonSlots(grade);
  const done = slots.filter((slot) => progress.completed.includes(slot.id)).length;
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language === "ky" ? "ky-KG" : "ru-RU");
    if (!normalized) return [...topics];
    return topics.filter((topic) => (language === "ru" ? topic.titleRu : topic.titleKy).toLocaleLowerCase().includes(normalized));
  }, [language, query, topics]);

  return (
    <div className={`page-surface grade-detail grade-detail-${grade}`}>
      <div className="grade-hero">
        <div className="shell grade-hero-inner">
          <div className="grade-hero-copy">
            <Link className="back-link" href="/grades">← {t(language, "Все классы", "Бардык класстар")}</Link>
            <span className="eyebrow compact"><span className="eyebrow-dot"/>{t(language, "Учебный маршрут 2026/2027", "2026/2027 окуу багыты")}</span>
            <h1>{t(language, `${grade}-й класс`, `${grade}-класс`)}</h1>
            <p>{grade === 1 ? t(language, "От ориентировки в пространстве до диаграмм Кэрролла и Венна.", "Мейкиндикте багыт алуудан Кэрролл жана Венн диаграммаларына чейин.") : t(language, "Числа до 100, умножение, геометрия, величины, уравнения и данные.", "100гө чейинки сандар, көбөйтүү, геометрия, чоңдуктар, теңдемелер жана маалыматтар.")}</p>
            <div className="grade-fact-row"><span><Icon name="book" size={18}/>{topics.length} {t(language, "тем", "тема")}</span><span><Icon name="clock" size={18}/>{totalHours(topics)} {t(language, "часов", "саат")}</span><span><Icon name="star" size={18}/>{done}/{slots.length}</span></div>
          </div>
          <div className="grade-hero-art" aria-hidden="true"><span className="grade-big-number">{grade}</span><span className="grade-symbol symbol-a">{grade === 1 ? "△" : "×"}</span><span className="grade-symbol symbol-b">{grade === 1 ? "○" : "100"}</span><span className="grade-symbol symbol-c">{grade === 1 ? "□" : "÷"}</span></div>
        </div>
      </div>
      <div className="shell curriculum-shell">
        <div className="curriculum-intro">
          <div><span className="kicker">{t(language, "Программа класса", "Класстын программасы")}</span><h2>{t(language, "Темы и учебные часы", "Темалар жана окуу сааттары")}</h2><p>{t(language, "Каждый час открывается отдельно и содержит 6 заданий с проверкой и подсказкой.", "Ар бир саат өзүнчө ачылып, текшерүү жана ишарасы бар 6 тапшырманы камтыйт.")}</p></div>
          <label className="topic-search"><span className="sr-only">{t(language, "Найти тему", "Теманы издөө")}</span><Icon name="compass" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(language, "Найти тему…", "Теманы издөө…")}/></label>
        </div>
        {grade === 2 && (
          <div className="source-anomaly"><Icon name="shield" size={20}/><div><strong>{t(language, "Нумерация сохранена как в источнике", "Номерлөө булактагыдай сакталды")}</strong><p>{t(language, "Вторая строка КТП не имеет номера, а после №13 указан №15. Мы показываем порядок отдельно и не присваиваем отсутствующий №14.", "КТПнын экинчи сабында номер жок, ал эми №13төн кийин №15 берилген. Тартип өзүнчө көрсөтүлүп, жок №14 ыйгарылган жок.")}</p></div></div>
        )}
        <div className="topic-list">
          {filtered.length ? filtered.map((topic) => <TopicCard grade={grade} topic={topic} key={topic.id}/>) : <div className="empty-search"><Icon name="compass" size={28}/><p>{t(language, "Тема не найдена. Попробуй другое слово.", "Тема табылган жок. Башка сөздү колдонуп көр.")}</p></div>}
        </div>
        <div className="curriculum-disclaimer"><Icon name="book" size={21}/><p>{t(language, "Названия и объём тем основаны на предоставленном примерном КТП. Разбиение на отдельные часы, сценарии и задания — авторская реализация BILIM и требует методической проверки перед официальной публикацией.", "Темалардын аталышы жана көлөмү берилген үлгүлүү КТПга негизделген. Өзүнчө сааттарга бөлүү, сценарийлер жана тапшырмалар — BILIMдин автордук иши жана расмий жарыялоодон мурун методикалык текшерүүнү талап кылат.")}</p></div>
      </div>
    </div>
  );
}
