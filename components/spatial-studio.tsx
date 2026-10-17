"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { t, useLanguage } from "@/app/providers";

type Position = "left" | "right" | "above" | "below" | "front" | "behind";

const targets: Record<number, { position: Position; ru: string; ky: string; focusRu: string; focusKy: string }> = {
  1: { position: "left", ru: "Помести мяч слева от коробки", ky: "Топту кутунун сол жагына жайгаштыр", focusRu: "Слева и справа относительно себя", focusKy: "Өзүңө карата сол жана оң" },
  2: { position: "right", ru: "Помести мяч справа от коробки", ky: "Топту кутунун оң жагына жайгаштыр", focusRu: "Положение относительно другого предмета", focusKy: "Башка буюмга карата жайгашуу" },
  3: { position: "above", ru: "Помести мяч над коробкой", ky: "Топту кутунун үстүнө жайгаштыр", focusRu: "Над, под и между", focusKy: "Үстүндө, астында жана ортосунда" },
  4: { position: "front", ru: "Помести мяч перед коробкой", ky: "Топту кутунун алдына жайгаштыр", focusRu: "Перед, за и точка наблюдения", focusKy: "Алдында, артында жана байкоо чекити" },
};

export function SpatialStudio({ part, onComplete }: { part: number; onComplete: () => void }) {
  const { language } = useLanguage();
  const target = targets[part] ?? targets[1];
  const [position, setPosition] = useState<Position>("right");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const boardRef = useRef<HTMLDivElement>(null);
  const controls = useMemo(() => [
    { value: "left" as const, labelRu: "Слева", labelKy: "Солдо", symbol: "←" },
    { value: "right" as const, labelRu: "Справа", labelKy: "Оңдо", symbol: "→" },
    { value: "above" as const, labelRu: "Над", labelKy: "Үстүндө", symbol: "↑" },
    { value: "below" as const, labelRu: "Под", labelKy: "Астында", symbol: "↓" },
    { value: "front" as const, labelRu: "Перед", labelKy: "Алдында", symbol: "●" },
    { value: "behind" as const, labelRu: "За", labelKy: "Артында", symbol: "○" },
  ], []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const next: Partial<Record<string, Position>> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "above", ArrowDown: "below", f: "front", b: "behind", а: "front", и: "behind" };
      const value = next[event.key];
      if (value) {
        event.preventDefault();
        setPosition(value);
        setStatus("idle");
      }
    }
    const board = boardRef.current;
    board?.addEventListener("keydown", handleKey);
    return () => board?.removeEventListener("keydown", handleKey);
  }, []);

  function check() {
    setStatus(position === target.position ? "correct" : "incorrect");
  }

  return (
    <div className="spatial-studio">
      <div className="task-topline"><span>{t(language, "Задание 1 из 6", "6 тапшырманын 1-тапшырмасы")}</span><div className="task-dots" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i className={index === 0 ? "filled" : ""} key={index}/>)}</div></div>
      <div className="studio-card">
        <div className="studio-heading"><div><span className="studio-focus">{t(language, target.focusRu, target.focusKy)}</span><h2>{t(language, target.ru, target.ky)}</h2></div><span className="keyboard-tip">{t(language, "Можно стрелками", "Жебелер менен болот")}</span></div>
        <div className="spatial-board" ref={boardRef} tabIndex={0} aria-label={t(language, "Поле для размещения мяча", "Топту жайгаштыруу талаасы")}>
          <div className="board-sky"><span/><span/></div>
          <div className="board-ground"/>
          <div className="object-box"><span>BILIM</span></div>
          <button className={`movable-ball pos-${position}`} type="button" aria-label={t(language, `Мяч: ${controls.find((item) => item.value === position)?.labelRu}`, `Топ: ${controls.find((item) => item.value === position)?.labelKy}`)}>⚽</button>
          <div className="board-label">{t(language, controls.find((item) => item.value === position)?.labelRu ?? "", controls.find((item) => item.value === position)?.labelKy ?? "")}</div>
        </div>
        <div className="position-controls" role="group" aria-label={t(language, "Выберите положение", "Жайгашууну танда")}>{controls.map((control) => <button className={position === control.value ? "active" : ""} key={control.value} onClick={() => { setPosition(control.value); setStatus("idle"); }} type="button"><span>{control.symbol}</span>{t(language, control.labelRu, control.labelKy)}</button>)}</div>
        {status !== "idle" && <div className={`feedback-panel ${status}`} role="status"><span className="feedback-icon">{status === "correct" ? <Icon name="check" size={22}/> : "↻"}</span><div><strong>{status === "correct" ? t(language, "Отлично расположено!", "Абдан туура жайгашты!") : t(language, "Посмотри ещё раз", "Дагы бир карап көр")}</strong><p>{status === "correct" ? t(language, "Положение совпадает с условием.", "Жайгашуу шартка туура келет.") : t(language, "Сначала найди коробку, затем выбери нужную сторону относительно неё.", "Адегенде кутуну тап, андан кийин ага карата керектүү тарапты танда.")}</p></div></div>}
        <div className="task-actions studio-actions"><span>{t(language, "Фокусируй поле и используй ← ↑ → ↓, F или B", "Талааны тандап, ← ↑ → ↓, F же B колдон")}</span>{status === "correct" ? <button className="button button-primary" onClick={onComplete} type="button">{t(language, "Дальше", "Андан ары")}<Icon name="arrow" size={18}/></button> : <button className="button button-dark" onClick={check} type="button">{t(language, "Проверить", "Текшерүү")}</button>}</div>
      </div>
    </div>
  );
}
