"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/app/providers";
import index from "@/content/authored-lessons/index.json";

const mapColors = [
  ["#536fe8", "#edf1ff"],
  ["#e98245", "#fff1e7"],
  ["#209b87", "#e8f8f3"],
  ["#bd69c7", "#f8edfa"],
  ["#d49a24", "#fff7df"],
  ["#508bc8", "#eaf5ff"],
] as const;

const mapArt: Record<string, readonly string[]> = {
  b04: ["🍎", "🍐", "🍌", "🍊", "🍓", "🍎"],
  b05: ["🚀", "🪐", "🌙", "⭐", "☀️", "🚀"],
  b06: ["🔭", "☀️", "🌈", "🌟"],
  b07: ["🏴‍☠️", "🧭", "🗝️", "🗺️"],
  b08: ["💎", "📦", "🪙", "💰"],
  b09: ["🏴‍☠️", "💰", "🍎", "🗝️"],
  b10: ["🚢", "🛟", "⚓", "🐬"],
  b11: ["🪐", "🌙", "⭐", "🚀"],
  b12: ["🧩", "🗝️", "🎁"],
  b13: ["🌞", "🌕", "⭐", "🌙"],
  b14: ["🧭", "🚀", "🪐"],
  b15: ["🌈", "🔷", "🔺", "🟡"],
  b16: ["🦊", "🍎", "📦"],
  b17: ["🐙", "🚢", "🪸"],
  b18: ["🖼️", "🦜", "🍊"],
  b19: ["🗝️", "📏", "🧰"],
  b20: ["💰", "💎", "⚖️"],
  b21: ["🏴‍☠️", "🧭", "🗝️"],
  b22: ["🐬", "📊", "🫧"],
  b23: ["☀️", "📋", "📝"],
  b24: ["🏝️", "⏰", "💵", "📏"],
  b25: ["🚂", "🛤️", "🚦"],
  b26: ["⭐", "🧮", "✨"],
  b27: ["🚀", "🦊", "🍐"],
  b28: ["🧭", "🔄", "🗺️"],
  b29: ["🍉", "🍰", "🌗"],
  b30: ["💎", "💠", "🔶"],
  b31: ["🛸", "🪐", "🌌"],
  b32: ["☀️", "🌡️", "🌈"],
  b33: ["🌈", "🔵", "🟡", "🔺"],
};

export function AuthoredCoursePage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const { completed } = useProgress();
  const blocks = [...new Set(index.lessons.map((lesson) => lesson.blockId))];
  const filtered = index.lessons.filter((lesson) => `${lesson.title} ${lesson.order}`.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")));
  const firstIncomplete = index.lessons.findIndex((lesson) => !completed.includes(lesson.id));
  const currentOrder = firstIncomplete < 0 ? index.lessons.length : firstIncomplete + 1;
  const completedCount = index.lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const colorFor = (blockId: string) => {
    const blockIndex = blocks.indexOf(blockId);
    return mapColors[Math.max(0, blockIndex) % mapColors.length];
  };
  const artFor = (lesson: (typeof index.lessons)[number]) => {
    const icons = mapArt[lesson.blockId] ?? ["🧭", "✨", "🌟"];
    return icons[(lesson.order - 1) % icons.length];
  };

  return <div className={`page-surface authored-course authored-course-${view}`} lang="ru"><div className="shell">
    <header className="authored-header course-hero"><div className="course-hero-copy"><span className="kicker">1 класс · Мастерская открытий</span><h1>Большие открытия<br/>маленькими шагами</h1><p>85 уроков · 30 тем · Объяснения, тесты и домашние задания</p><p className="authored-note">Курс по обновлённому КТП. Материалы на русском языке.</p></div><Image className="course-hero-mentor" src="/assets/zhyldyz-mentor.png" alt="" width={1120} height={1374} sizes="(max-width: 600px) 120px, 200px" /></header>
    <div className="course-view-switch" role="group" aria-label="Вид программы">
      <button type="button" className={view === "map" ? "active" : ""} aria-pressed={view === "map"} onClick={() => setView("map")}><span aria-hidden="true">🗺️</span><span><strong>Карта приключений</strong><small>Играй и открывай острова</small></span></button>
      <button type="button" className={view === "list" ? "active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><span aria-hidden="true">📚</span><span><strong>Список уроков</strong><small>Привычный вид по темам</small></span></button>
    </div>
    <div className="course-view-heading"><div><span className="kicker">{view === "map" ? "ТВОЁ ПУТЕШЕСТВИЕ" : "ПРОГРАММА КУРСА"}</span><h2>{view === "map" ? "Плыви от урока к уроку!" : "Темы и уроки"}</h2><p>{view === "map" ? "Нажми на остров, чтобы начать урок. За пройденный урок получишь звезду!" : "Выбери тему и найди нужный урок в списке."}</p></div><span className="course-view-progress">⭐ {completedCount} / {index.lessons.length}</span></div>
    <label className="authored-search"><span>Найти урок</span><input type="search" placeholder="Например, числа или время" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    {!filtered.length && <p role="status">Уроков с таким названием пока нет. Попробуй другое слово.</p>}
    {view === "map" ? <div className="kid-adventure-map" aria-label="Карта из 85 уроков">
      {Array.from({ length: Math.ceil(filtered.length / 5) }, (_, rowIndex) => {
        const row = filtered.slice(rowIndex * 5, rowIndex * 5 + 5);
        const reversed = rowIndex % 2 === 1;
        return <div className={`kid-map-row${reversed ? " reverse" : ""}`} key={row[0]?.id ?? rowIndex}>
          {row.map((lesson) => {
            const complete = completed.includes(lesson.id);
            const current = !complete && lesson.order === currentOrder;
            const [accent, tint] = colorFor(lesson.blockId);
            return <Link
              className={`kid-map-stop${complete ? " complete" : ""}${current ? " current" : ""}`}
              href={`/course/grade-1/${lesson.id}`}
              key={lesson.id}
              aria-label={`Урок ${lesson.order}: ${lesson.title}${complete ? ", пройден" : current ? ", следующий урок" : ""}`}
              aria-current={current ? "step" : undefined}
              style={{ "--stop-accent": accent, "--stop-tint": tint } as React.CSSProperties}
            >
              <span className="kid-map-art" aria-hidden="true">{artFor(lesson)}</span>
              {complete && <span className="kid-map-star" aria-hidden="true">★</span>}
              {current && <span className="kid-map-ship" aria-hidden="true">🚢</span>}
              <span className="kid-map-number">{complete ? "Пройдено" : `Урок ${lesson.order}`}</span>
              <strong>{lesson.title}</strong>
              <small>{lesson.topic}</small>
            </Link>;
          })}
        </div>;
      })}
    </div> : <div className="authored-blocks">{blocks.map((block) => {
      const lessons = filtered.filter((lesson) => lesson.blockId === block);
      return lessons.length ? <section key={block} className="authored-block"><h2>{lessons[0].topic}</h2><div className="authored-lesson-list">{lessons.map((lesson) => <Link key={lesson.id} href={`/course/grade-1/${lesson.id}`}><span className={completed.includes(lesson.id) ? "earned" : ""}>{completed.includes(lesson.id) ? "★" : lesson.order}</span><div><strong>{lesson.title}</strong><small>Урок · 10 заданий · Д/З</small></div><span aria-hidden="true">→</span></Link>)}</div></section> : null;
    })}</div>}
  </div></div>;
}
