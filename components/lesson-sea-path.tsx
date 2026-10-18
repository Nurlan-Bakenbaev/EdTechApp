"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { t, useLanguage, useProgress } from "@/app/providers";
import { activeLessonSlots, lessonHref } from "@/lib/course-navigation";

const POINTS = [
  { x: 90, y: 300 }, { x: 200, y: 160 }, { x: 330, y: 290 }, { x: 440, y: 130 },
  { x: 540, y: 270 }, { x: 640, y: 120 }, { x: 740, y: 260 }, { x: 830, y: 140 },
];
const VISIBLE = POINTS.length;

function Island({ x, y, state, label, current }: { x: number; y: number; state: "earned" | "available"; label: string; current: boolean }) {
  const done = state === "earned";
  return <g transform={`translate(${x} ${y})`} className={`sea-island ${state}${current ? " current" : ""}`}>
    {current ? <circle className="sea-island-glow" r="62" /> : null}
    <ellipse className="sea-island-foam" cx="0" cy="22" rx="58" ry="20" />
    <ellipse cx="0" cy="18" rx="50" ry="15" fill="#f2d79a" />
    <path d="M-44 18 Q-30 -18 0 -20 Q32 -18 44 18 Z" fill={done ? "#59c26a" : "#7dd3a0"} />
    <path d="M-30 12 Q-12 -4 6 4 Q20 -6 32 12 Z" fill={done ? "#3da552" : "#5bbf86"} />
    <g transform="translate(-22 -10)">
      <path d="M0 0 Q-2 -18 2 -32" stroke="#8a5a2b" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M2 -32 Q-16 -42 -26 -30 M2 -32 Q16 -44 28 -30 M2 -32 Q0 -50 -10 -50 M2 -32 Q8 -50 18 -46" stroke="#2f9e44" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
    {done ? <g transform="translate(22 -14)"><path d="M0 0 V-34" stroke="#6b4423" strokeWidth="3" /><path d="M0 -34 H22 L16 -27 L22 -20 H0 Z" fill="#ffd43b" /></g>
      : <g transform="translate(24 8)"><rect x="-9" y="-12" width="18" height="12" rx="2" fill="#c98a4b" /><rect x="-9" y="-12" width="18" height="4" rx="2" fill="#a86a2f" /></g>}
    <circle cy="46" r="17" className="sea-island-badge" />
    <text y="53" textAnchor="middle" className="sea-island-number">{done ? "★" : label}</text>
  </g>;
}

function Ship() {
  return <g>
    <ellipse cx="0" cy="26" rx="34" ry="6" fill="#0b4f8a" opacity=".25" />
    <path d="M-30 6 H30 L20 26 H-20 Z" fill="#b5562b" />
    <path d="M-30 6 H30 L28 11 H-28 Z" fill="#8a3f1d" />
    <circle cx="-10" cy="16" r="2.5" fill="#ffe8a3" /><circle cx="2" cy="16" r="2.5" fill="#ffe8a3" /><circle cx="14" cy="16" r="2.5" fill="#ffe8a3" />
    <rect x="-1.5" y="-44" width="3" height="50" fill="#5b3a1e" />
    <path d="M3 -42 Q34 -24 3 -4 Z" fill="#fff" stroke="#dbe4f0" strokeWidth="1" />
    <path d="M-3 -36 Q-24 -22 -3 -8 Z" fill="#ffe3e3" stroke="#f1c0c0" strokeWidth="1" />
    <path d="M-1 -44 L-1 -54 L14 -50 L-1 -46 Z" fill="#ff6b6b" />
  </g>;
}

export function LessonSeaPath() {
  const { language } = useLanguage();
  const { completed } = useProgress();
  const router = useRouter();
  const slots = activeLessonSlots(1);
  const firstIncomplete = slots.findIndex((slot) => !completed.includes(slot.id));
  const current = firstIncomplete < 0 ? slots.length - 1 : firstIncomplete;
  const start = Math.min(Math.max(0, current - 2), Math.max(0, slots.length - VISIBLE));
  const visible = slots.slice(start, start + VISIBLE);
  const shipIndex = Math.min(Math.max(0, current - start), visible.length - 1);
  const route = POINTS.slice(0, visible.length);
  const trail = route.slice(0, shipIndex + 1);
  const shipX = trail.map((p) => p.x);
  const shipY = trail.map((p) => p.y + 4);
  const d = route.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y + 24}`).join(" ");
  const go = (href: string) => router.push(href);
  const onKey = (href: string) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); go(href); }
  };

  return <section className="dashboard-section">
    <div className="dashboard-section-heading"><div><span className="kicker">{t(language, "1-й класс", "1-класс")}</span><h2>{t(language, "Карта приключений", "Укмуштуу окуялар картасы")}</h2></div></div>
    <p>{t(language, "Веди кораблик от острова к острову: каждый урок открывает новый остров.", "Кемени аралдан аралга алып бар: ар бир сабак жаңы арал ачат.")}</p>
    <div className="sea-path">
      <svg viewBox="0 0 920 400" role="group" aria-label={t(language, "Морской путь по урокам", "Сабактар боюнча деңиз жолу")}>
        <defs>
          <linearGradient id="sea-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fdcff" /><stop offset="1" stopColor="#2a8fd8" /></linearGradient>
        </defs>
        <rect width="920" height="400" rx="28" fill="url(#sea-bg)" />
        <g className="sea-waves sea-waves-a" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round">
          <path d="M30 60 q15 -12 30 0 t30 0" /><path d="M330 40 q15 -12 30 0 t30 0" /><path d="M640 70 q15 -12 30 0 t30 0" />
          <path d="M150 360 q15 -12 30 0 t30 0" /><path d="M520 370 q15 -12 30 0 t30 0" /><path d="M800 350 q15 -12 30 0 t30 0" />
        </g>
        <g className="sea-waves sea-waves-b" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round">
          <path d="M240 90 q15 -12 30 0 t30 0" /><path d="M560 380 q15 -12 30 0 t30 0" /><path d="M60 210 q15 -12 30 0 t30 0" /><path d="M860 220 q15 -12 30 0 t30 0" />
        </g>
        <g className="sea-cloud" fill="#fff" opacity=".85"><ellipse cx="140" cy="46" rx="34" ry="12" /><ellipse cx="164" cy="38" rx="22" ry="12" /></g>
        <g className="sea-cloud sea-cloud-b" fill="#fff" opacity=".8"><ellipse cx="620" cy="30" rx="30" ry="10" /><ellipse cx="642" cy="24" rx="18" ry="10" /></g>
        <path d={d} className="sea-route" />
        {visible.map((slot, i) => {
          const complete = completed.includes(slot.id);
          const href = lessonHref(slot);
          const name = language === "ru" ? slot.topic.titleRu : slot.topic.titleKy;
          const label = `${slot.globalHour}. ${name}`;
          return <g key={slot.id} role="link" tabIndex={0} aria-label={label} aria-current={start + i === current ? "step" : undefined}
            className="sea-stop" onClick={() => go(href)} onKeyDown={onKey(href)}>
            <title>{label}</title>
            <Island x={route[i].x} y={route[i].y} state={complete ? "earned" : "available"} label={String(slot.globalHour)} current={start + i === current} />
          </g>;
        })}
        <motion.g
          key={`${start}-${shipIndex}`}
          initial={{ x: shipX[0], y: shipY[0] }}
          animate={{ x: shipX, y: shipY }}
          transition={{ duration: Math.max(0.01, shipIndex * 1.1), ease: "easeInOut" }}
          style={{ pointerEvents: "none" }}
        >
          <g className="sea-ship"><Ship /></g>
        </motion.g>
      </svg>
    </div>
  </section>;
}
