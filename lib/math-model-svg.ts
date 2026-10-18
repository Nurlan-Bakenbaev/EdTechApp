import type { MathModel } from "./authored-types";

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
const n = (model: MathModel, key: string, fallback = 0) => typeof model[key] === "number" && Number.isFinite(model[key]) ? model[key] as number : fallback;
const arr = (model: MathModel, key: string) => Array.isArray(model[key]) ? model[key] as unknown[] : [];
const text = (x: number, y: number, value: unknown, size = 20) => `<text x="${x}" y="${y}" font-family="NotoSans" font-size="${size}" text-anchor="middle" fill="#17302d">${esc(value)}</text>`;
const rect = (x: number, y: number, width: number, height: number, fill = "#e2f2eb") => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" fill="${fill}" stroke="#315c50" stroke-width="2"/>`;
const line = (x: number, y: number, x2: number, y2: number, stroke = "#315c50", width = 2) => `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
const dots = (count: number, x = 25, y = 30, columns = 5, step = 38) => Array.from({ length: Math.max(0, Math.min(100, count)) }, (_, index) => `<circle cx="${x + index % columns * step}" cy="${y + Math.floor(index / columns) * step}" r="${Math.min(18, step * 0.32)}" fill="#d5e9df" stroke="#315c50" stroke-width="2"/>`).join("");

export function modelSvg(model: MathModel): { svg: string; width: number; height: number } {
  let width = 520, height = 190, body = "";
  switch (model.renderer) {
    case "countable_objects": width = 300; height = Math.max(80, Math.ceil(n(model, "count") / 5) * 56 + 20); body = rect(4, 4, width - 8, height - 8, "white") + dots(n(model, "count"), 38, 36, 5, 56); break;
    case "digit_sample": body = text(260, 145, model.digit, 150); break;
    case "number_cards": body = arr(model, "values").map((value, i) => rect(10 + i * 65, 35, 56, 65) + text(38 + i * 65, 77, value, 28)).join(""); break;
    case "group_cards": body = arr(model, "counts").map((value, i) => `<g transform="translate(${i * 170},0)">${rect(5, 5, 160, 180)}${dots(Number(value), 23, 25, 5, 28)}</g>`).join(""); break;
    case "ten_frames": {
      const count = n(model, "full_tens") * 10 + n(model, "units");
      height = Math.max(120, Math.ceil(count / 10) * 100);
      body = Array.from({ length: Math.max(1, Math.ceil(count / 10)) * 10 }, (_, i) => rect(10 + i % 5 * 40, 10 + Math.floor(i / 5) * 40 + Math.floor(i / 10) * 15, 40, 40, i < count ? "#b8dccb" : "white") + (i < count ? `<circle cx="${30 + i % 5 * 40}" cy="${30 + Math.floor(i / 5) * 40 + Math.floor(i / 10) * 15}" r="10" fill="#315c50"/>` : "")).join(""); break;
    }
    case "part_whole": body = line(260, 45, 140, 140) + line(260, 45, 380, 140) + [[260, 45, model.whole], [140, 140, model.left], [380, 140, model.right]].map(([x, y, value]) => rect(Number(x) - 40, Number(y) - 30, 80, 60) + text(Number(x), Number(y) + 9, value ?? "?", 30)).join(""); break;
    case "queue": body = text(260, 25, model.start_direction) + dots(n(model, "count"), 25, 75, 12, 40); break;
    case "operation_scene": {
      const a = n(model, "a"), b = n(model, "b");
      if (model.a === null || model.b === null) { body = text(260, 70, "?", 60); break; }
      if (model.operation === "subtract") body = dots(a, 30, 35, 10, 40) + Array.from({ length: b }, (_, i) => line(18 + i % 10 * 40, 23 + Math.floor(i / 10) * 40, 42 + i % 10 * 40, 47 + Math.floor(i / 10) * 40, "#17302d", 3)).join("");
      else if (model.operation === "half") body = dots(a, 30, 30, 10, 40) + rect(30, 125, 180, 50, "white") + rect(270, 125, 180, 50, "white");
      else body = dots(a, 25, 30, 5, 30) + text(220, 70, "+", 35) + dots(b, 285, 30, 5, 30);
      break;
    }
    case "equation": body = text(260, 95, `${model.a ?? "?"} ${model.op} ${model.b ?? "?"} = ${model.result ?? "?"}`, 38); break;
    case "number_line":
    case "ruler_segment": {
      const min = n(model, model.renderer === "number_line" ? "minimum" : "scale_min"), max = n(model, model.renderer === "number_line" ? "maximum" : "scale_max", 20);
      const dx = 480 / Math.max(1, max - min);
      body = line(20, 90, 500, 90) + Array.from({ length: Math.min(101, max - min + 1) }, (_, i) => line(20 + i * dx, 80, 20 + i * dx, 100) + text(20 + i * dx, 125, min + i, 14)).join("");
      if (model.renderer === "ruler_segment") body += line(20 + (n(model, "start") - min) * dx, 50, 20 + (n(model, "end") - min) * dx, 50, "#17302d", 8) + text(260, 170, "см · считывай нарисованную шкалу", 16);
      else for (const mark of arr(model, "marks")) body += `<circle cx="${20 + (Number(mark) - min) * dx}" cy="90" r="6" fill="#315c50"/>`;
      break;
    }
    case "addition_table": {
      const rows = arr(model, "row_headers"), columns = arr(model, "column_headers"); height = (rows.length + 1) * 35; width = (columns.length + 1) * 35;
      body = ["+", ...columns].map((v, i) => rect(i * 35, 0, 35, 35) + text(i * 35 + 17, 24, v, 14)).join("");
      rows.forEach((r, y) => { body += rect(0, (y + 1) * 35, 35, 35) + text(17, (y + 1) * 35 + 24, r, 14); columns.forEach((c, x) => { body += rect((x + 1) * 35, (y + 1) * 35, 35, 35, Number(r) === n(model, "target_row") || Number(c) === n(model, "target_column") ? "#fff2cb" : "white") + text((x + 1) * 35 + 17, (y + 1) * 35 + 24, Number(r) === n(model, "target_row") && Number(c) === n(model, "target_column") ? "?" : Number(r) + Number(c), 14); }); }); break;
    }
    case "spatial_grid": width = 240; height = 240; body = Array.from({ length: 9 }, (_, i) => rect(i % 3 * 80, Math.floor(i / 3) * 80, 80, 80, "white") + (arr(model, "reference_cells").includes(i) ? `<path d="M${i % 3 * 80 + 15},${Math.floor(i / 3) * 80 + 35} l25,-22 l25,22 v30 h-50 z" fill="#d4e8de" stroke="#315c50"/>` : "")).join(""); break;
    case "shape_card": {
      width = 180; height = 150;
      const shape = String(model.shape);
      if (shape === "круг" || shape === "шар") body = `<circle cx="90" cy="75" r="53" fill="#d5e9df" stroke="#315c50" stroke-width="3"/>` + (shape === "шар" ? `<ellipse cx="90" cy="75" rx="53" ry="16" fill="none" stroke="#315c50" stroke-dasharray="4 4"/>` : "");
      else if (shape === "треугольник") body = `<path d="M90 15 L155 130 L25 130 Z" fill="#d5e9df" stroke="#315c50" stroke-width="3"/>`;
      else if (shape === "цилиндр") body = rect(40, 35, 100, 85) + `<ellipse cx="90" cy="35" rx="50" ry="18" fill="#d5e9df" stroke="#315c50"/><path d="M40 120 A50 18 0 0 0 140 120" fill="none" stroke="#315c50"/>`;
      else if (shape === "куб" || shape.includes("параллелепипед")) body = `<path d="M25 55 L65 20 L155 20 L155 100 L115 135 L25 135 Z M25 55 H115 V135 M115 55 L155 20" fill="#d5e9df" stroke="#315c50" stroke-width="3"/>`;
      else body = rect(shape === "квадрат" ? 40 : 10, 25, shape === "квадрат" ? 100 : 160, shape === "квадрат" ? 100 : 80);
      if (model.rotation_degrees) body = `<g transform="rotate(${n(model, "rotation_degrees")} 90 75)">${body}</g>`;
      break;
    }
    case "data_display": {
      const rows = arr(model, "rows") as { label: string; value: number }[]; height = rows.length * 55 + 45;
      body = rows.map((row, i) => text(75, 35 + i * 55, row.label, 17) + (model.style === "table" || model.style === "list" ? text(250, 35 + i * 55, row.value, 24) : dots(row.value, 170, 29 + i * 55, 20, 16))).join("");
      if (model.style === "pictogram") body += text(260, height - 10, "1 значок = 1 предмет", 16); break;
    }
    case "scale_reading": body = rect(100, 30, 320, 120, "white") + text(260, 100, `${model.value} ${model.unit}`, 40) + (model.capacity != null ? text(260, 175, `Вместимость: ${model.capacity} ${model.unit}`, 18) : ""); break;
    case "labelled_pair": body = rect(20, 20, 210, 130) + rect(290, 20, 210, 130) + text(125, 90, `А: ${model.a} ${model.unit}`, 26) + text(395, 90, `Б: ${model.b} ${model.unit}`, 26); break;
    case "day_scene":
    case "story_card": { const content = String(model.clue ?? model.text ?? ""); const words = content.split(" "); const lines: string[] = []; let current = ""; words.forEach((word) => { if ((current + word).length > 42) { lines.push(current); current = ""; } current += `${word} `; }); lines.push(current); height = lines.length * 32 + 25; body = lines.map((value, i) => text(260, 30 + i * 32, value, 20)).join(""); break; }
    case "calendar_cycle": { const values = arr(model, "values"); height = Math.ceil(values.length / 3) * 55 + 30; body = values.map((value, i) => rect(i % 3 * 170 + 5, Math.floor(i / 3) * 55 + 5, 160, 48, i === model.highlight ? "#fff2cb" : "white") + text(i % 3 * 170 + 85, Math.floor(i / 3) * 55 + 36, value, 17)).join("") + text(260, height - 5, "↶"); break; }
    case "clock_face": {
      width = 240; height = 240; body = `<circle cx="120" cy="120" r="108" fill="white" stroke="#315c50" stroke-width="3"/>`;
      for (let hour = 1; hour <= 12; hour++) { const angle = hour * Math.PI / 6; body += text(120 + Math.sin(angle) * 87, 128 - Math.cos(angle) * 87, hour, 20); }
      const hourAngle = (30 * (n(model, "hour") % 12) + n(model, "minute") / 2) * Math.PI / 180, minuteAngle = n(model, "minute") * Math.PI / 30;
      body += line(120, 120, 120 + Math.sin(hourAngle) * 55, 120 - Math.cos(hourAngle) * 55, "#17302d", 7) + line(120, 120, 120 + Math.sin(minuteAngle) * 78, 120 - Math.cos(minuteAngle) * 78, "#17302d", 3); break;
    }
    case "money_cards": { const values = arr(model, "denominations"); height = Math.ceil(values.length / 5) * 65 + 10; body = values.map((v, i) => rect(i % 5 * 100 + 5, Math.floor(i / 5) * 65 + 5, 90, 55) + text(i % 5 * 100 + 50, Math.floor(i / 5) * 65 + 40, `${v} сом`, 19)).join(""); break; }
    case "instrument_cards": body = arr(model, "instruments").map((v, i) => rect(i % 2 * 260 + 5, Math.floor(i / 2) * 85 + 5, 250, 75) + text(i % 2 * 260 + 130, Math.floor(i / 2) * 85 + 50, v, 22)).join(""); break;
    case "polyline": { let x = 25, y = 65; body = ""; arr(model, "segment_lengths").forEach((value, i) => { const angle = Number(arr(model, "angles_degrees")[i] ?? 0) * Math.PI / 180, dx = Number(value) * 25 * Math.cos(angle), dy = Number(value) * 25 * Math.sin(angle); body += line(x, y, x + dx, y + dy, "#17302d", 4) + text(x + dx / 2, y + dy / 2 - 12, `${value} см`, 16); x += dx; y += dy; }); width = Math.max(300, x + 30); break; }
    case "comparison": body = text(260, 90, `${model.left ?? model.left_value}    □    ${model.right_expression}`, 35); break;
    case "partition_strip":
    case "strip_puzzle":
    case "strip_part": { const cells = n(model, "cells", n(model, "whole_cells", 1)), cellWidth = Math.min(45, 490 / cells); body = Array.from({ length: cells }, (_, i) => rect(10 + i * cellWidth, 50, cellWidth, 65, model.renderer === "strip_puzzle" ? "white" : "#d5e9df")).join(""); if (model.cut_after) body += line(10 + n(model, "cut_after") * cellWidth, 35, 10 + n(model, "cut_after") * cellWidth, 130, "#17302d", 5) + text(10 + n(model, "cut_after") * cellWidth / 2, 150, "А") + text(10 + (n(model, "cut_after") + cells) * cellWidth / 2, 150, "Б"); break; }
    case "rotation_arrow": width = 200; height = 200; body = `<path d="M100 15 L145 75 H120 V180 H80 V75 H55 Z" fill="#d5e9df" stroke="#315c50" stroke-width="3" transform="rotate(${n(model, "start_angle")} 100 100)"/>`; break;
    case "thermometer": { width = 180; height = 320; const min = n(model, "minimum"), max = n(model, "maximum", 20), unit = 260 / (max - min); body = rect(50, 20, 30, 260, "white") + rect(53, 280 - (n(model, "value") - min) * unit, 24, (n(model, "value") - min) * unit, "#477561"); for (let i = min; i <= max; i += n(model, "step", 1)) body += line(85, 280 - (i - min) * unit, 100, 280 - (i - min) * unit) + text(123, 285 - (i - min) * unit, i, 13); body += text(65, 310, model.unit, 20); break; }
    case "classification": body = text(260, 80, "Есть три стороны?", 28) + text(150, 145, "Да") + text(370, 145, "Нет"); break;
    default: body = text(260, 70, "Модель");
  }
  return { width, height, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>` };
}
