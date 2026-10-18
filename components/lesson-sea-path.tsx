"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { t, useLanguage, useProgress } from "@/app/providers";
import { activeLessonSlots, lessonHref } from "@/lib/course-navigation";

const POINTS = [
  { x: 90, y: 300 }, { x: 200, y: 160 }, { x: 330, y: 290 }, { x: 440, y: 130 },
  { x: 540, y: 270 }, { x: 640, y: 120 }, { x: 740, y: 260 }, { x: 830, y: 140 },
];
const VISIBLE = POINTS.length;

function routeThrough(points: typeof POINTS): string {
  if (points.length === 0) return "";
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const middle = (previous.x + point.x) / 2;
    const curve = (point.y - previous.y) * 0.18;
    return `${path} C${middle} ${previous.y + 24 + curve}, ${middle} ${point.y + 24 - curve}, ${point.x} ${point.y + 24}`;
  }, `M${points[0].x} ${points[0].y + 24}`);
}

function Island({ x, y, state, label, current, currentLabel, index }: { x: number; y: number; state: "earned" | "available"; label: string; current: boolean; currentLabel: string; index: number }) {
  const done = state === "earned";
  return <g transform={`translate(${x} ${y})`} className={`sea-island ${state}${current ? " current" : ""}`}>
    {current && <circle className="sea-island-glow" r="72" />}
    <ellipse className="sea-island-shadow" cx="0" cy="30" rx="63" ry="23" />
    <ellipse className="sea-island-foam" cx="0" cy="23" rx="61" ry="21" />
    <ellipse className="sea-island-lagoon" cx="0" cy="22" rx="51" ry="16" />
    <path d="M-49 20 Q-40 6 -34 -2 Q-20 -17 -2 -20 Q20 -21 34 -5 Q44 4 49 20 Q31 30 0 30 Q-29 29 -49 20Z" fill={done ? "url(#island-earned)" : "url(#island-green)"} />
    <path d="M-35 18 Q-18 2 -4 8 Q8 -3 24 8 Q35 12 42 21 Q15 28 -10 24 Q-24 23 -35 18Z" fill={done ? "#3ba960" : "#54bd82"} />
    <path d="M-32 12 Q-28 2 -22 -3 M22 16 Q28 10 33 8" fill="none" stroke="#b6efb9" strokeWidth="3" strokeLinecap="round" opacity=".7" />
    <g className="sea-palm" style={{ animationDelay: `${index * -0.35}s` }}>
      <path d="M-22 2 Q-25 -16 -20 -34" stroke="#95602f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M-20 -34 Q-39 -50 -51 -39 M-20 -34 Q-3 -54 12 -45 M-20 -34 Q-24 -57 -38 -59 M-20 -34 Q1 -36 15 -28 M-20 -34 Q-8 -62 1 -62" stroke="#288c56" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M-20 -33 Q-39 -50 -48 -41 M-20 -34 Q-1 -52 10 -44" stroke="#76d993" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
    <g className="sea-palm sea-palm-small">
      <path d="M23 12 Q20 1 24 -10" stroke="#95602f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 -9 Q10 -20 4 -12 M24 -9 Q35 -22 44 -14 M24 -9 Q24 -23 18 -25" stroke="#328c58" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
    {done
      ? <g className="sea-island-flag" transform="translate(31 -23)"><path d="M0 0 V-26" stroke="#754726" strokeWidth="3" /><path d="M0 -25 H18 L13 -19 L18 -13 H0Z" fill="#ffca4c" /></g>
      : <g className="sea-treasure" transform="translate(31 9)"><path d="M-10 -4 Q0 -17 10 -4 V1 H-10Z" fill="#a85b30" /><rect x="-11" y="-4" width="22" height="15" rx="4" fill="#d59237" /><path d="M-11 2 H11 M0 -4 V11" stroke="#f8d477" strokeWidth="3" /><circle cy="3" r="2" fill="#fff1b4" /></g>}
    <circle cx="-42" cy="4" r="2.3" fill="#fff" opacity=".9" />
    <circle cx="44" cy="10" r="1.7" fill="#fff" opacity=".8" />
    <circle cy="46" r="18" className="sea-island-badge" />
    <circle cy="46" r="14" className="sea-island-badge-inner" />
    <text y="52" textAnchor="middle" className="sea-island-number">{done ? "★" : label}</text>
    {current && <text y="78" textAnchor="middle" className="sea-island-current-label">{currentLabel}</text>}
    {index % 2 === 0 && <path className="sea-island-sparkle" d="M-53 -51 v8 m-4 -4 h8" />}
  </g>;
}

function Ship() {
  return <g>
    <ellipse className="sea-ship-shadow" cx="0" cy="27" rx="35" ry="7" />
    <path d="M-30 4 H31 L19 25 Q2 31 -18 25Z" fill="url(#ship-hull)" stroke="#8e3b28" strokeWidth="2" />
    <path d="M-29 5 H30 L27 11 H-27Z" fill="#ffe7a2" />
    <path d="M-18 14 H17" stroke="#8e3b28" strokeWidth="2" opacity=".65" />
    <circle cx="-11" cy="18" r="2" fill="#fff2b4" /><circle cx="1" cy="18" r="2" fill="#fff2b4" /><circle cx="13" cy="18" r="2" fill="#fff2b4" />
    <rect x="-1.8" y="-47" width="3.6" height="52" rx="1.5" fill="#71462c" />
    <path d="M4 -44 Q35 -26 4 -5Z" fill="url(#sail-light)" stroke="#fff" strokeWidth="1.5" />
    <path d="M-4 -39 Q-28 -23 -4 -9Z" fill="#ff7c7b" stroke="#fff" strokeWidth="1.5" />
    <path d="M-1 -47 L-1 -58 L15 -53 L-1 -49Z" fill="#ffcb4f" />
    <path className="sea-ship-wake" d="M-38 32 Q-52 36 -62 31 M-34 38 Q-47 42 -54 39" />
    <circle className="sea-ship-sparkle" cx="38" cy="12" r="2" />
  </g>;
}

export function LessonSeaPath() {
  const { language } = useLanguage();
  const { completed } = useProgress();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const slots = activeLessonSlots(1);
  const firstIncomplete = slots.findIndex((slot) => !completed.includes(slot.id));
  const current = firstIncomplete < 0 ? slots.length - 1 : firstIncomplete;
  const start = Math.min(Math.max(0, current - 2), Math.max(0, slots.length - VISIBLE));
  const visible = slots.slice(start, start + VISIBLE);
  const shipIndex = Math.min(Math.max(0, current - start), visible.length - 1);
  const route = POINTS.slice(0, visible.length);
  const trail = route.slice(0, shipIndex + 1);
  const shipX = trail.map((p) => p.x + 56);
  const shipY = trail.map((p) => p.y + 40);
  const d = routeThrough(route);
  const earnedRoute = routeThrough(route.slice(0, Math.max(1, shipIndex + 1)));
  const go = (href: string) => router.push(href);
  const onKey = (href: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(href); }
  };

  return <section className="dashboard-section">
    <div className="dashboard-section-heading"><div><span className="kicker">{t(language, "1-й класс", "1-класс")}</span><h2>{t(language, "Карта приключений", "Укмуштуу окуялар картасы")}</h2></div></div>
    <p>{t(language, "Веди кораблик от острова к острову: каждый урок открывает новый остров.", "Кемени аралдан аралга алып бар: ар бир сабак жаңы арал ачат.")}</p>
    <div className="sea-path">
      <svg viewBox="0 0 920 430" role="group" aria-label={t(language, "Морской путь по урокам", "Сабактар боюнча деңиз жолу")}>
        <defs>
          <linearGradient id="sea-bg" x1="0" y1="0" x2=".14" y2="1"><stop offset="0" stopColor="#7bd6f3" /><stop offset=".48" stopColor="#39a8db" /><stop offset="1" stopColor="#1474bd" /></linearGradient>
          <linearGradient id="island-green" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#95e59b" /><stop offset="1" stopColor="#48b876" /></linearGradient>
          <linearGradient id="island-earned" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a7ec8d" /><stop offset="1" stopColor="#5bb869" /></linearGradient>
          <linearGradient id="ship-hull" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#dd8150" /><stop offset="1" stopColor="#a94a33" /></linearGradient>
          <linearGradient id="sail-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" /><stop offset="1" stopColor="#ffeab4" /></linearGradient>
          <radialGradient id="sea-sun-glow"><stop stopColor="#fff5bd" stopOpacity=".7" /><stop offset="1" stopColor="#fff5bd" stopOpacity="0" /></radialGradient>
          <pattern id="sea-texture" width="120" height="80" patternUnits="userSpaceOnUse"><path d="M8 20 Q24 12 40 20 T72 20 M65 60 Q81 52 97 60" fill="none" stroke="#fff" strokeOpacity=".11" strokeWidth="2" /></pattern>
        </defs>
        <rect width="920" height="430" rx="30" fill="url(#sea-bg)" />
        <rect width="920" height="430" rx="30" fill="url(#sea-texture)" />
        <circle className="sea-sun-glow" cx="780" cy="72" r="110" fill="url(#sea-sun-glow)" />
        <g className="sea-sun"><circle cx="780" cy="72" r="28" fill="#fff3b4" /><circle cx="780" cy="72" r="19" fill="#fff9dc" /></g>
        <path d="M0 370 Q230 346 420 381 T920 365 V430 H0Z" fill="#155c96" opacity=".22" />
        <path d="M0 391 Q230 369 420 397 T920 387" fill="none" stroke="#b5f0eb" strokeOpacity=".26" strokeWidth="4" />
        <g className="sea-waves sea-waves-a" fill="none" stroke="#dcfbff" strokeOpacity=".52" strokeWidth="3" strokeLinecap="round">
          <path d="M34 84 q16 -12 32 0 t32 0" /><path d="M304 61 q16 -12 32 0 t32 0" /><path d="M634 87 q16 -12 32 0 t32 0" />
          <path d="M158 382 q16 -12 32 0 t32 0" /><path d="M520 404 q16 -12 32 0 t32 0" /><path d="M812 367 q16 -12 32 0 t32 0" />
        </g>
        <g className="sea-waves sea-waves-b" fill="none" stroke="#fff" strokeOpacity=".36" strokeWidth="2.5" strokeLinecap="round">
          <path d="M214 105 q13 -10 26 0 t26 0" /><path d="M574 360 q13 -10 26 0 t26 0" /><path d="M36 230 q13 -10 26 0 t26 0" /><path d="M858 244 q13 -10 26 0 t26 0" />
        </g>
        <g className="sea-cloud" fill="#fff" opacity=".88"><ellipse cx="124" cy="46" rx="34" ry="13" /><ellipse cx="152" cy="38" rx="23" ry="14" /><ellipse cx="174" cy="47" rx="29" ry="12" /></g>
        <g className="sea-cloud sea-cloud-b" fill="#fff" opacity=".79"><ellipse cx="605" cy="43" rx="30" ry="11" /><ellipse cx="628" cy="35" rx="19" ry="12" /><ellipse cx="650" cy="44" rx="25" ry="10" /></g>
        <g className="sea-bird sea-bird-a" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M410 68 q8 -9 16 0 q8 -9 16 0" /></g>
        <g className="sea-bird sea-bird-b" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M700 133 q7 -8 14 0 q7 -8 14 0" /></g>
        <path d={d} className="sea-route-shadow" />
        <path d={d} className="sea-route" />
        {shipIndex > 0 && <path d={earnedRoute} className="sea-route-earned" />}
        {visible.map((slot, i) => {
          const complete = completed.includes(slot.id);
          const href = lessonHref(slot);
          const name = language === "ru" ? slot.topic.titleRu : slot.topic.titleKy;
          const label = `${slot.globalHour}. ${name}`;
          return <g key={slot.id} role="link" tabIndex={0} aria-label={label} aria-current={start + i === current ? "step" : undefined}
            className="sea-stop" onClick={() => go(href)} onKeyDown={onKey(href)}>
            <title>{label}</title>
            <Island
              x={route[i].x}
              y={route[i].y}
              state={complete ? "earned" : "available"}
              label={String(slot.globalHour)}
              current={start + i === current}
              currentLabel={t(language, "ТЫ ЗДЕСЬ", "СЕН БУЛ ЖЕРДЕСИҢ")}
              index={i}
            />
          </g>;
        })}
        <motion.g
          key={`${start}-${shipIndex}`}
          initial={reducedMotion ? false : { x: shipX[0], y: shipY[0] }}
          animate={reducedMotion
            ? { x: shipX[shipX.length - 1], y: shipY[shipY.length - 1] }
            : { x: shipX, y: shipY }}
          transition={{ duration: reducedMotion ? 0 : Math.max(0.01, shipIndex * 1.1), ease: "easeInOut" }}
          style={{ pointerEvents: "none" }}
        >
          <g className="sea-ship"><Ship /></g>
        </motion.g>
        <g className="sea-splash sea-splash-a" fill="#fff" opacity=".7"><circle cx="250" cy="330" r="2" /><circle cx="260" cy="326" r="1.5" /><circle cx="824" cy="300" r="2" /></g>
      </svg>
    </div>
  </section>;
}
