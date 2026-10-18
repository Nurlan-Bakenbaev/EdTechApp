import type { LessonFruit } from "@/lib/practice";

const fruitCycle: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];

const fruitWords: Record<LessonFruit, { label: string; plural: string; counted: string; genitive: string; singular: string; accusative: string; eachNominative: string; eachAccusative: string }> = {
  apple: { label: "Яблоки", plural: "яблоки", counted: "яблока", genitive: "яблок", singular: "яблоко", accusative: "яблоко", eachNominative: "каждое яблоко", eachAccusative: "каждое яблоко" },
  pear: { label: "Груши", plural: "груши", counted: "груши", genitive: "груш", singular: "груша", accusative: "грушу", eachNominative: "каждая груша", eachAccusative: "каждую грушу" },
  banana: { label: "Бананы", plural: "бананы", counted: "банана", genitive: "бананов", singular: "банан", accusative: "банан", eachNominative: "каждый банан", eachAccusative: "каждый банан" },
  orange: { label: "Апельсины", plural: "апельсины", counted: "апельсина", genitive: "апельсинов", singular: "апельсин", accusative: "апельсин", eachNominative: "каждый апельсин", eachAccusative: "каждый апельсин" },
  strawberry: { label: "Ягоды клубники", plural: "ягоды", counted: "ягоды", genitive: "ягод", singular: "ягода", accusative: "ягоду", eachNominative: "каждая ягода", eachAccusative: "каждую ягоду" },
};

export function lessonFruitForId(id: string): LessonFruit {
  const lessonNumber = Number(id.match(/g1_l(\d+)/)?.[1] ?? 1);
  return fruitCycle[(Math.max(1, lessonNumber) - 1) % fruitCycle.length];
}

export function lessonFruitLabel(fruit: LessonFruit): string {
  return fruitWords[fruit].label;
}

export function lessonFruitCountLabel(fruit: LessonFruit, count: number): string {
  const words = fruitWords[fruit];
  const lastTwoDigits = Math.abs(count) % 100;
  const lastDigit = Math.abs(count) % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? words.genitive
    : lastDigit === 1
      ? words.singular
      : lastDigit >= 2 && lastDigit <= 4
        ? words.counted
        : words.genitive;
  return `${count} ${noun}`;
}

export function replaceCounterNouns(value: string, fruit: LessonFruit): string {
  const words = fruitWords[fruit];
  const preserveCase = (original: string, replacement: string) =>
    original[0] === original[0].toLocaleUpperCase("ru-RU")
      ? replacement[0].toLocaleUpperCase("ru-RU") + replacement.slice(1)
      : replacement;
  return value
    .replace(/кажд(ая|ую)\s+фишк[ау]/gi, (original, ending: string) => preserveCase(original, ending.toLocaleLowerCase("ru-RU") === "ую" ? words.eachAccusative : words.eachNominative))
    .replace(/фишек/gi, (original) => preserveCase(original, words.genitive))
    .replace(/фишки/gi, (original) => preserveCase(original, words.plural))
    .replace(/фишку/gi, (original) => preserveCase(original, words.accusative))
    .replace(/фишка/gi, (original) => preserveCase(original, words.singular));
}
