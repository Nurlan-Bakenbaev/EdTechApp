"use client";

import Image from "next/image";
import type { Language } from "@/app/providers";
import type { FruitGroup, LessonFruit } from "@/lib/practice";

const fruitLabels: Record<LessonFruit, { ru: string; ky: string }> = {
  apple: { ru: "Яблоки", ky: "Алмалар" },
  pear: { ru: "Груши", ky: "Алмуруттар" },
  banana: { ru: "Бананы", ky: "Банандар" },
  orange: { ru: "Апельсины", ky: "Апельсиндер" },
  strawberry: { ru: "Клубника", ky: "Кулпунайлар" },
};

export function FruitIllustration({
  groups,
  language,
}: {
  groups: FruitGroup[];
  language: Language;
}) {
  return (
    <div className="task-fruit-visual" aria-hidden="true">
      {groups.map((group, groupIndex) => (
        <div className="task-fruit-row" key={`${group.fruit}-${groupIndex}`}>
          <span className="task-fruit-label">
            {group.label?.[language] ?? fruitLabels[group.fruit][language]}
          </span>
          <span className="task-fruit-clusters">
            {Array.from({ length: group.groupCount ?? 1 }, (_, clusterIndex) => (
              <span className="task-fruit-cluster" key={`${group.fruit}-${groupIndex}-cluster-${clusterIndex}`}>
                {Array.from({ length: group.count }, (_, index) => (
                  <Image
                    alt=""
                    height={42}
                    key={`${group.fruit}-${groupIndex}-${clusterIndex}-${index}`}
                    sizes="42px"
                    src={`/assets/lesson-objects/${group.fruit}.svg`}
                    width={42}
                  />
                ))}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
