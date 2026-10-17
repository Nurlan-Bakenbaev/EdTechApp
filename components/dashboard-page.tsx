"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage, useProgress } from "@/app/providers";
import { expandLessonSlots } from "@/lib/curriculum";

export function DashboardPage() {
  const { language } = useLanguage();
  const progress = useProgress();
  const allSlots = [...expandLessonSlots(1), ...expandLessonSlots(2)];
  const completedPercent = Math.round((progress.completed.length / allSlots.length) * 100);
  const last = allSlots.find((slot) => slot.id === progress.lastLesson) ?? allSlots[0];
  const continueHref = `/lesson/${last.grade}/${last.topic.sourceOrder}/${last.part}`;

  return (
    <div className="page-surface dashboard-surface">
      <div className="shell dashboard-shell">
        <section className="dashboard-welcome">
          <div>
            <span className="eyebrow compact"><span className="eyebrow-dot" />{t(language, "Детский кабинет", "Балдар кабинети")}</span>
            <h1>{t(language, "С возвращением!", "Кайра келгениңе кубанычтабыз!")}</h1>
            <p>{t(language, "Сегодня достаточно одного маленького шага.", "Бүгүн бир кичинекей кадам жетиштүү.")}</p>
          </div>
          <div className="streak-card"><span><Icon name="flame" size={24}/></span><div><strong>{Math.max(1, Math.min(7, progress.completed.length || 1))}</strong><small>{t(language, "дней подряд", "күн катары")}</small></div></div>
        </section>

        <div className="dashboard-grid">
          <section className="continue-card">
            <div className="continue-content">
              <span className="card-overline">{t(language, "Продолжить обучение", "Окууну улантуу")}</span>
              <div className="lesson-index">{t(language, `Класс ${last.grade} · час ${last.globalHour}`, `${last.grade}-класс · ${last.globalHour}-саат`)}</div>
              <h2>{language === "ru" ? last.topic.titleRu : last.topic.titleKy}</h2>
              <p>{t(language, `Часть ${last.part} из ${last.topic.hours}`, `${last.topic.hours} бөлүктүн ${last.part}-бөлүгү`)}</p>
              <div className="progress-track large"><span style={{ width: `${Math.max(8, ((last.part - 1) / last.topic.hours) * 100)}%` }} /></div>
              <Link className="button button-primary" href={continueHref}>{t(language, "Продолжить", "Улантуу")} <Icon name="arrow" size={18}/></Link>
            </div>
            <div className="continue-mascot" aria-hidden="true"><Image src="/assets/zhyldyz-mentor.png" alt="" width={1120} height={1374}/></div>
          </section>

          <aside className="progress-summary">
            <div className="summary-header"><span className="summary-icon"><Icon name="trophy" size={22}/></span><div><strong>{t(language, "Мой прогресс", "Менин жетишкендигим")}</strong><span>{t(language, "Сохраняется на устройстве", "Түзмөктө сакталат")}</span></div></div>
            <div className="progress-ring" style={{ "--progress": `${completedPercent * 3.6}deg` } as React.CSSProperties}><div><strong>{completedPercent}%</strong><span>{t(language, "курса", "курстун")}</span></div></div>
            <div className="summary-stats"><div><strong>{progress.completed.length}</strong><span>{t(language, "часов готово", "саат бүттү")}</span></div><div><strong>{progress.xp}</strong><span>{t(language, "звёзд", "жылдыз")}</span></div></div>
          </aside>
        </div>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><span className="kicker">{t(language, "Мои маршруты", "Менин багыттарым")}</span><h2>{t(language, "Выбери класс", "Классты танда")}</h2></div><Link href="/grades">{t(language, "Все классы", "Бардык класстар")} <Icon name="chevron" size={16}/></Link></div>
          <div className="route-grid">
            {[1, 2].map((grade) => {
              const slots = expandLessonSlots(grade as 1 | 2);
              const done = slots.filter((slot) => progress.completed.includes(slot.id)).length;
              const percent = Math.round((done / slots.length) * 100);
              return (
                <Link className={`route-card route-${grade}`} href={`/grades/${grade}`} key={grade}>
                  <div className="route-number">{grade}</div>
                  <div className="route-body"><span>{t(language, `${grade}-й класс`, `${grade}-класс`)}</span><h3>{grade === 1 ? t(language, "Первые открытия", "Алгачкы ачылыштар") : t(language, "Уверенные шаги", "Ишенимдүү кадамдар")}</h3><div className="progress-track"><span style={{ width: `${Math.max(percent, 2)}%` }}/></div><p>{t(language, `${done} из ${slots.length} часов`, `${slots.length} сааттын ${done} сааты`)}</p></div>
                  <span className="route-arrow"><Icon name="arrow" size={19}/></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><span className="kicker">{t(language, "Коллекция", "Жыйнак")}</span><h2>{t(language, "Достижения", "Жетишкендиктер")}</h2></div></div>
          <div className="achievement-row">
            <div className={`achievement ${progress.completed.length >= 1 ? "earned" : ""}`}><span><Icon name="compass" size={27}/></span><div><strong>{t(language, "Первый маршрут", "Биринчи багыт")}</strong><p>{t(language, "Заверши первый час", "Биринчи саатты бүтүр")}</p></div></div>
            <div className={`achievement ${progress.completed.length >= 4 ? "earned" : ""}`}><span><Icon name="star" size={27}/></span><div><strong>{t(language, "Знаток пространства", "Мейкиндик билерманы")}</strong><p>{t(language, "Заверши модуль из 4 часов", "4 сааттык модулду бүтүр")}</p></div></div>
            <div className={`achievement ${progress.completed.length >= 10 ? "earned" : ""}`}><span><Icon name="trophy" size={27}/></span><div><strong>{t(language, "Десять шагов", "Он кадам")}</strong><p>{t(language, "Заверши 10 часов", "10 саатты бүтүр")}</p></div></div>
          </div>
        </section>
      </div>
    </div>
  );
}
