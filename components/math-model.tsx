"use client";

import Image from "next/image";
import { modelSvg } from "@/lib/math-model-svg";
import type { MathModel } from "@/lib/authored-types";
import type { LessonFruit } from "@/lib/practice";
import { lessonFruitCountLabel } from "@/lib/lesson-fruit";

function FruitModel({ model, label, fruit }: { model: MathModel; label: string; fruit: LessonFruit }) {
  const operationValue = model.renderer === "operation_scene" ? model.operation : undefined;
  const operation = operationValue === "add" || operationValue === "subtract" || operationValue === "half" ? operationValue : undefined;
  const rawCounts = model.renderer === "countable_objects"
    ? [typeof model.count === "number" ? model.count : 0]
    : model.renderer === "group_cards"
      ? Array.isArray(model.counts) ? model.counts.map((count) => typeof count === "number" ? count : 0) : []
      : operation === "add"
        ? [model.a, model.b]
        : operation === "subtract"
          ? [model.a]
          : operation === "half"
            ? [typeof model.a === "number" ? Math.ceil(model.a / 2) : 0, typeof model.a === "number" ? Math.floor(model.a / 2) : 0]
            : [];
  const counts = rawCounts.map((count) => typeof count === "number" ? count : 0);
  const columns = model.renderer === "group_cards" || operation ? 5 : 6;
  const removedCount = operation === "subtract" && typeof model.b === "number" ? model.b : 0;

  return (
    <div className={`authored-fruit-model${model.renderer === "group_cards" || operation ? " grouped" : ""}${operation ? ` operation-${operation}` : ""}`} role="img" aria-label={`${label}: ${counts.map((count) => lessonFruitCountLabel(fruit, count)).join(operation === "add" ? " плюс " : ", ")}`}>
      {counts.map((count, groupIndex) => (
        <div className={`authored-fruit-group${operation === "subtract" ? " has-removed" : ""}`} key={groupIndex}>
          {(counts.length > 1 || operation) && <span className="authored-fruit-group-label">{operation === "add" ? groupIndex === 0 ? "Было" : "Добавили" : operation === "subtract" ? "Было" : operation === "half" ? groupIndex === 0 ? "Первая часть" : "Вторая часть" : `${label} ${groupIndex + 1}`}</span>}
          <div className="authored-fruit-items" style={{ "--fruit-columns": columns } as React.CSSProperties}>
            {Array.from({ length: Math.max(0, Math.min(100, count)) }, (_, itemIndex) => <span className={`authored-fruit-token${operation === "subtract" && itemIndex < removedCount ? " removed" : ""}`} key={itemIndex}>
              <Image
                className="authored-fruit-item"
                src={`/assets/lesson-objects/${fruit}.svg`}
                alt=""
                width={42}
                height={42}
                sizes="42px"
                aria-hidden="true"
              />
              {operation === "subtract" && itemIndex < removedCount && <i aria-hidden="true" />}
            </span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MathModelView({ model, label = "Математическая модель", fruit = "apple" }: { model: MathModel; label?: string; fruit?: LessonFruit }) {
  if (model.renderer === "countable_objects" || model.renderer === "group_cards" || (model.renderer === "operation_scene" && model.a !== null && model.b !== null)) {
    return <FruitModel model={model} label={label} fruit={fruit} />;
  }
  const { svg, width, height } = modelSvg(model);
  return <svg className="authored-model" role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}><image href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} width={width} height={height} /></svg>;
}
