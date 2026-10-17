"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";

const sources = [
  { kind: "DOCX", name: "Lastenheft v4.0", statusRu: "Бизнес-требования", statusKy: "Бизнес талаптар", factRu: "1–5 классы, RU/KY, роли, педагогика и безопасность", factKy: "1–5-класстар, RU/KY, ролдор, педагогика жана коопсуздук" },
  { kind: "DOCX", name: "Pflichtenheft 1.1", statusRu: "Проект спецификации", statusKy: "Спецификация долбоору", factRu: "Функции, данные, критерии приёмки и реестры тем", factKy: "Функциялар, маалыматтар, кабыл алуу критерийлери жана темалар реестри" },
  { kind: "PDF", name: "КТП 1 класса", statusRu: "Примерный план", statusKy: "Үлгүлүү план", factRu: "33 темы · 96 часов · 2026/2027", factKy: "33 тема · 96 саат · 2026/2027" },
  { kind: "PDF", name: "КТП 2 класса", statusRu: "Примерный план", statusKy: "Үлгүлүү план", factRu: "25 строк · 132 часа · аномалия нумерации", factKy: "25 сап · 132 саат · номерлөө өзгөчөлүгү" },
  { kind: "PDF", name: "КТП 3 класса", statusRu: "Ведомственный примерный", statusKy: "Ведомстволук үлгүлүү", factRu: "41 тема · 136 часов · трек в файле не указан", factKy: "41 тема · 136 саат · багыт файлда көрсөтүлгөн эмес" },
  { kind: "PDF", name: "КТП 5→6", statusRu: "Переходность не подтверждена", statusKy: "Өткөөлдүк ырасталган эмес", factRu: "85 часов 5 класса + 85 часов 6 класса", factKy: "5-класс 85 саат + 6-класс 85 саат" },
  { kind: "PDF", name: "Приказ №973/1", statusRu: "Официальный приказ", statusKy: "Расмий буйрук", factRu: "11-летний трек; приложения 1–2 отсутствуют в копии", factKy: "11 жылдык багыт; көчүрмөдө 1–2 тиркеме жок" },
  { kind: "PDF", name: "Стандарт 1–4 классов, 2019", statusRu: "Исторический стандарт", statusKy: "Тарыхый стандарт", factRu: "Не является КТП 2026/2027", factKy: "2026/2027 КТП эмес" },
];

export function SourcesPage() {
  const { language } = useLanguage();
  return (
    <div className="page-surface sources-surface">
      <div className="shell sources-shell">
        <header className="page-heading source-heading">
          <span className="eyebrow compact"><span className="eyebrow-dot"/>{t(language, "Прозрачность источников", "Булактардын ачыктыгы")}</span>
          <h1>{t(language, "Что подтверждено, а что ещё нужно проверить", "Эмне ырасталды, эмнени дагы текшерүү керек")}</h1>
          <p>{t(language, "BILIM отделяет данные исходных документов от авторских уроков и не обозначает неполные программы как утверждённые.", "BILIM баштапкы документтердин маалыматын автордук сабактардан бөлүп, толук эмес программаларды бекитилген деп көрсөтпөйт.")}</p>
          <div className="source-actions"><Link className="button button-primary" href="/grades">{t(language, "Открыть программы", "Программаларды ачуу")} <Icon name="arrow" size={18}/></Link><a className="button button-ghost" href="/api/source-audit">{t(language, "Скачать аудит", "Аудитти жүктөө")}</a></div>
        </header>
        <section className="source-metrics">
          <div><strong>9</strong><span>{t(language, "исходных файлов", "баштапкы файл")}</span></div>
          <div><strong>2</strong><span>{t(language, "готовых класса", "даяр класс")}</span></div>
          <div><strong>0</strong><span>{t(language, "найденных XLSX", "табылган XLSX")}</span></div>
          <div><strong>228</strong><span>{t(language, "часов 1–2 классов", "1–2-класстын сааты")}</span></div>
        </section>
        <section className="source-list-section">
          <div className="section-heading split-heading compact-heading"><div><span className="kicker">{t(language, "Реестр", "Реестр")}</span><h2>{t(language, "Изученные материалы", "Изилденген материалдар")}</h2></div><p>{t(language, "Полные технические замечания находятся в docs/SOURCE_AUDIT.md.", "Толук техникалык эскертүүлөр docs/SOURCE_AUDIT.md файлында.")}</p></div>
          <div className="source-card-list">
            {sources.map((source) => (
              <article className="source-card" key={source.name}>
                <span className="file-kind">{source.kind}</span>
                <div><h3>{source.name}</h3><p>{t(language, source.factRu, source.factKy)}</p></div>
                <span className="source-status">{t(language, source.statusRu, source.statusKy)}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="missing-panel">
          <div className="missing-icon"><Icon name="shield" size={27}/></div>
          <div><span className="kicker">{t(language, "Открытые вопросы", "Ачык суроолор")}</span><h2>{t(language, "Чего не хватает для официального полного курса", "Расмий толук курс үчүн эмне жетишпейт")}</h2><ul><li>{t(language, "Заявленного Excel-реестра на 874 проектных часа", "874 долбоордук саатка көрсөтүлгөн Excel реестри")}</li><li>{t(language, "Детального КТП 4 класса и полных приложений к приказу", "4-класстын толук КТПсы жана буйруктун толук тиркемелери")}</li><li>{t(language, "Проверенного кыргызского глоссария и протоколов методиста", "Текшерилген кыргызча глоссарий жана методисттин протоколдору")}</li><li>{t(language, "Исходников заявленного старого frontend-прототипа", "Көрсөтүлгөн мурдагы frontend-прототиптин булак коду")}</li></ul></div>
        </section>
      </div>
    </div>
  );
}
