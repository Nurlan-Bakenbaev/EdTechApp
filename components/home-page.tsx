"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { HeroMathScene } from "@/components/hero-math-scene";
import { t, useLanguage } from "@/app/providers";

const pillars = [
  {
    icon: "compass" as const,
    ru: "Понять на модели",
    ky: "Модель аркылуу түшүнүү",
    bodyRu: "Сначала ребёнок двигает, сравнивает и замечает правило — только потом видит знак.",
    bodyKy: "Адегенде бала жылдырат, салыштырат жана эрежени байкайт — андан кийин гана белгини көрөт.",
  },
  {
    icon: "sparkle" as const,
    ru: "Ошибка помогает",
    ky: "Ката жардам берет",
    bodyRu: "Подсказка объясняет следующий шаг и даёт новый пример, не раскрывая ответ сразу.",
    bodyKy: "Ишара кийинки кадамды түшүндүрүп, жоопту дароо ачпастан жаңы мисал берет.",
  },
  {
    icon: "shield" as const,
    ru: "Спокойный темп",
    ky: "Ыңгайлуу ыргак",
    bodyRu: "Без рейтинга скорости, рекламы и открытого общения. Прогресс хранится на этом устройстве.",
    bodyKy: "Ылдамдык рейтинги, жарнама жана ачык баарлашуу жок. Жетишкендик ушул түзмөктө сакталат.",
  },
];

export function HomePage() {
  const { language } = useLanguage();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".section-heading, .class-card, .planned-strip, .pillar-card, .demo-copy, .mini-scene, .final-cta",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="shell hero-grid">
          <div className="hero-copy reveal-up">
            <div className="eyebrow"><span className="eyebrow-dot" />{t(language, "Математика Кыргызстана · 2026/2027", "Кыргызстандын математикасы · 2026/2027")}</div>
            <h1>{t(language, "Математика становится", "Математика")} <span>{t(language, "приключением", "кызыктуу сапарга айланат")}</span></h1>
            <p>{t(language, "Живые задания для 1–2 классов: ребёнок исследует, объясняет и видит свой прогресс на русском или кыргызском языке.", "1–2-класстар үчүн жандуу тапшырмалар: бала изилдейт, түшүндүрөт жана орус же кыргыз тилинде өзүнүн өсүшүн көрөт.")}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/dashboard">
                {t(language, "Начать учиться", "Окууну баштоо")} <Icon name="arrow" size={19} />
              </Link>
              <Link className="button button-ghost" href="/lesson/1/1/1">
                <span className="play-dot"><Icon name="play" size={14} /></span>{t(language, "Попробовать урок", "Сабакты сынап көрүү")}
              </Link>
            </div>
            <div className="hero-facts" aria-label={t(language, "Объём программы", "Программанын көлөмү")}>
              <div><strong>58</strong><span>{t(language, "тем из КТП", "КТП темасы")}</span></div>
              <div><strong>228</strong><span>{t(language, "учебных часов", "окуу сааты")}</span></div>
              <div><strong>RU · KY</strong><span>{t(language, "единая математика", "бир математика")}</span></div>
            </div>
          </div>
          <div className="hero-visual reveal-up delay-one">
            <HeroMathScene />
            <div className="math-bubble bubble-one">7 + 5</div>
            <div className="math-bubble bubble-two">△ ○ □</div>
            <div className="mascot-glow" />
            <Image className="hero-mascot" src="/assets/zhyldyz-mentor.png" alt="" width={1120} height={1374} loading="eager" />
            <div className="mentor-card">
              <span className="mentor-avatar"><Icon name="sparkle" size={17} /></span>
              <div><strong>{t(language, "Жылдыз рядом", "Жылдыз жаныңда")}</strong><span>{t(language, "Подскажет следующий шаг", "Кийинки кадамды көрсөтөт")}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="programs">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><span className="kicker">{t(language, "Учебный маршрут", "Окуу багыты")}</span><h2>{t(language, "Два класса — один ясный путь", "Эки класс — бир түшүнүктүү жол")}</h2></div>
            <p>{t(language, "Темы и часы перенесены из предоставленных примерных КТП. Каждая тема раскрывается в отдельных учебных часах.", "Темалар жана сааттар берилген үлгүлүү КТПдан алынды. Ар бир тема өзүнчө окуу сааттарында ачылат.")}</p>
          </div>
          <div className="class-showcase">
            <Link className="class-card class-one" href="/grades/1">
              <div className="class-card-top"><span className="class-number">1</span><span className="status-pill live"><span />{t(language, "Доступен", "Жеткиликтүү")}</span></div>
              <div><span className="class-label">{t(language, "Первый класс", "Биринчи класс")}</span><h3>{t(language, "От пространства к числам", "Мейкиндиктен сандарга")}</h3><p>{t(language, "33 темы · 96 часов", "33 тема · 96 саат")}</p></div>
              <span className="card-arrow"><Icon name="arrow" size={20} /></span>
              <div className="shape-cluster"><i/><i/><i/></div>
            </Link>
            <Link className="class-card class-two" href="/grades/2">
              <div className="class-card-top"><span className="class-number">2</span><span className="status-pill live"><span />{t(language, "Доступен", "Жеткиликтүү")}</span></div>
              <div><span className="class-label">{t(language, "Второй класс", "Экинчи класс")}</span><h3>{t(language, "До 100 и дальше", "100гө чейин жана андан ары")}</h3><p>{t(language, "25 строк · 132 часа", "25 сап · 132 саат")}</p></div>
              <span className="card-arrow"><Icon name="arrow" size={20} /></span>
              <div className="number-cluster"><b>25</b><b>50</b><b>100</b></div>
            </Link>
          </div>
          <div className="planned-strip">
            <span className="planned-icon"><Icon name="map" size={21} /></span>
            <div><strong>{t(language, "3–5 классы остаются в плане", "3–5-класстар планда калат")}</strong><p>{t(language, "Источники содержат противоречивые переходные траектории и неполный 4-й класс — поэтому они не выданы как готовые курсы.", "Булактарда өткөөл багыттар карама-каршы жана 4-класс толук эмес — ошондуктан алар даяр курс катары көрсөтүлгөн жок.")}</p></div>
            <Link href="/sources">{t(language, "Посмотреть аудит", "Аудитти көрүү")} <Icon name="chevron" size={16}/></Link>
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="shell">
          <div className="section-heading centered-heading"><span className="kicker">{t(language, "Как проходит урок", "Сабак кандай өтөт")}</span><h2>{t(language, "Ребёнок действует, а не угадывает", "Бала болжобой, аракет кылат")}</h2></div>
          <div className="pillar-grid">
            {pillars.map((pillar, index) => (
              <article className="pillar-card" key={pillar.ru}>
                <span className={`pillar-icon pillar-${index + 1}`}><Icon name={pillar.icon} size={25}/></span>
                <span className="step-number">0{index + 1}</span>
                <h3>{t(language, pillar.ru, pillar.ky)}</h3>
                <p>{t(language, pillar.bodyRu, pillar.bodyKy)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section demo-section">
        <div className="shell demo-grid">
          <div className="demo-copy">
            <span className="kicker">{t(language, "Первый модуль", "Биринчи модуль")}</span>
            <h2>{t(language, "Ориентация в пространстве", "Мейкиндикте багыт алуу")}</h2>
            <p>{t(language, "Четыре учебных часа: слева и справа, положение рядом с коробкой, над и под, перед и за. Ребёнок двигает мяч и объясняет решение.", "Төрт окуу сааты: сол жана оң, кутунун жанындагы орун, үстү жана асты, алды жана арты. Бала топту жылдырып, чечимин түшүндүрөт.")}</p>
            <ul className="check-list">
              <li><Icon name="check" size={17}/>{t(language, "Управление мышью, касанием и клавиатурой", "Чычкан, тийүү жана клавиатура менен башкаруу")}</li>
              <li><Icon name="check" size={17}/>{t(language, "Объяснение ошибки и новая попытка", "Катаны түшүндүрүү жана жаңы аракет")}</li>
              <li><Icon name="check" size={17}/>{t(language, "Прогресс сохраняется локально", "Жетишкендик жергиликтүү сакталат")}</li>
            </ul>
            <Link className="button button-dark" href="/lesson/1/1/1">{t(language, "Открыть модуль", "Модулду ачуу")} <Icon name="arrow" size={19}/></Link>
          </div>
          <div className="mini-scene" aria-hidden="true">
            <div className="scene-sky"><span className="cloud c1"/><span className="cloud c2"/></div>
            <div className="scene-ground" />
            <div className="scene-box">BILIM</div>
            <div className="scene-ball">⚽</div>
            <div className="scene-prompt"><span>←</span>{t(language, "Мяч слева от коробки", "Топ кутунун сол жагында")}</div>
          </div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="shell final-cta">
          <div className="cta-stars" aria-hidden="true">✦ · ✧ · ✦</div>
          <span className="kicker light">{t(language, "Первый шаг уже готов", "Биринчи кадам даяр")}</span>
          <h2>{t(language, "Выбери класс и начни с понятного задания", "Классты тандап, түшүнүктүү тапшырмадан башта")}</h2>
          <p>{t(language, "Без регистрации: можно сразу открыть урок и проверить, как работает BILIM.", "Каттоосуз: сабакты дароо ачып, BILIM кантип иштегенин текшерсе болот.")}</p>
          <Link className="button button-light" href="/grades">{t(language, "Выбрать класс", "Классты тандоо")} <Icon name="arrow" size={19}/></Link>
        </div>
      </section>
    </>
  );
}
