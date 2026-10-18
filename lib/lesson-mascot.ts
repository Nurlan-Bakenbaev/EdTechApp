export interface LessonMascot {
  name: string;
  src: string;
}

const lessonMascots: LessonMascot[] = [
  { name: "котёнок", src: "/assets/mascots/math-cat.webp" },
  { name: "капибара", src: "/assets/mascots/math-capybara.webp" },
  { name: "енот", src: "/assets/mascots/math-raccoon.webp" },
];

export function lessonMascotForId(id: string): LessonMascot {
  const lessonNumber = Number(id.match(/g1_l(\d+)/)?.[1] ?? 1);
  return lessonMascots[(Math.max(1, lessonNumber) - 1) % lessonMascots.length];
}
