export type LessonPhaseId = "A" | "B" | "C" | "D";
export type SpatialRelation = "left" | "right" | "above" | "below";
export type SpatialMover = "ball" | "box";

export interface LessonPhase {
  id: LessonPhaseId;
  targetSeconds: number;
  label: { ru: string; ky: string };
}

export const lessonPhases: LessonPhase[] = [
  { id: "A", targetSeconds: 120, label: { ru: "Зацепка", ky: "Кызыктыруу" } },
  { id: "B", targetSeconds: 240, label: { ru: "Разбираемся", ky: "Үйрөнөбүз" } },
  { id: "C", targetSeconds: 360, label: { ru: "Пробуем", ky: "Аракет кылабыз" } },
  { id: "D", targetSeconds: 480, label: { ru: "Проверяем", ky: "Текшеребиз" } },
];

export const homeworkTargetSeconds = 240;

export type MathValidator =
  | { kind: "integer-equality"; expected: number; minimum?: number; maximum?: number }
  | { kind: "comparison"; left: number; right: number }
  | { kind: "choice-equality"; expected: string }
  | {
      kind: "fraction-equality";
      numerator: number;
      denominator: number;
      expectedNumerator: number;
      expectedDenominator: number;
    }
  | { kind: "spatial-position"; expected: SpatialRelation }
  | { kind: "polygon-perimeter"; edgeLengths: number[]; expected: number };

export interface SpatialChallenge {
  id: string;
  relation: SpatialRelation;
  mover: SpatialMover;
  prompt: { ru: string; ky: string };
}

const relationText: Record<SpatialRelation, { ru: string; ky: string }> = {
  left: { ru: "слева", ky: "сол жагында" },
  right: { ru: "справа", ky: "оң жагында" },
  above: { ru: "над", ky: "үстүндө" },
  below: { ru: "под", ky: "астында" },
};

export const guidedSpatialChallenges: SpatialChallenge[] = [
  { id: "guided-left", relation: "left", mover: "ball", prompt: { ru: "Помести мяч слева от коробки.", ky: "Топту кутунун сол жагына кой." } },
  { id: "guided-right", relation: "right", mover: "ball", prompt: { ru: "Теперь помести мяч справа от коробки.", ky: "Эми топту кутунун оң жагына кой." } },
  { id: "guided-below", relation: "below", mover: "ball", prompt: { ru: "А теперь помести мяч под коробку.", ky: "Эми топту кутунун астына кой." } },
];

const assessmentRelations: SpatialRelation[] = [
  "left", "right", "above", "below", "right", "left", "above", "below", "left", "below",
];

export function createSpatialAssessment(round = 0): SpatialChallenge[] {
  return assessmentRelations.map((relation, index) => {
    const rotatedRelation = assessmentRelations[(index + (round % assessmentRelations.length)) % assessmentRelations.length];
    const mover: SpatialMover = (index + round) % 3 === 2 ? "box" : "ball";
    const relativeTo = mover === "ball" ? "коробки" : "мяча";
    const relativeToKy = mover === "ball" ? "кутунун" : "топтун";
    const relationLabel = relationText[rotatedRelation];

    return {
      id: `assessment-r${round + 1}-q${index + 1}`,
      relation: rotatedRelation,
      mover,
      prompt: {
        ru: `Помести ${mover === "ball" ? "мяч" : "коробку"} ${relationLabel.ru} ${relativeTo}.`,
        ky: `${mover === "ball" ? "Топту" : "Кутуну"} ${relationLabel.ky} ${relativeToKy} кой.`,
      },
    };
  });
}

function parseWholeNumber(answer: unknown): number | null {
  if (typeof answer === "number") return Number.isSafeInteger(answer) ? answer : null;
  if (typeof answer !== "string" || !/^-?(0|[1-9]\d*)$/.test(answer.trim())) return null;
  const value = Number(answer);
  return Number.isSafeInteger(value) ? value : null;
}

export function validateMathAnswer(validator: MathValidator, answer: unknown): boolean {
  switch (validator.kind) {
    case "integer-equality": {
      const value = parseWholeNumber(answer);
      if (value === null) return false;
      if (validator.minimum !== undefined && value < validator.minimum) return false;
      if (validator.maximum !== undefined && value > validator.maximum) return false;
      return value === validator.expected;
    }
    case "comparison": {
      const expected = validator.left < validator.right ? "<" : validator.left > validator.right ? ">" : "=";
      return answer === expected;
    }
    case "choice-equality":
      return typeof answer === "string" && answer === validator.expected;
    case "fraction-equality": {
      const denominator = validator.denominator;
      const expectedDenominator = validator.expectedDenominator;
      if (
        !Number.isSafeInteger(validator.numerator)
        || !Number.isSafeInteger(denominator)
        || !Number.isSafeInteger(validator.expectedNumerator)
        || !Number.isSafeInteger(expectedDenominator)
        || denominator === 0
        || expectedDenominator === 0
      ) return false;
      const match = typeof answer === "string" ? /^(-?\d+)\/(-?\d+)$/.exec(answer.trim()) : null;
      if (!match) return false;
      const numerator = Number(match[1]);
      const submittedDenominator = Number(match[2]);
      if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(submittedDenominator) || submittedDenominator === 0) return false;
      const left = numerator * expectedDenominator;
      const right = validator.expectedNumerator * submittedDenominator;
      return Number.isSafeInteger(left) && Number.isSafeInteger(right) && left === right;
    }
    case "spatial-position":
      return answer === validator.expected;
    case "polygon-perimeter": {
      if (
        !Number.isSafeInteger(validator.expected)
        || validator.edgeLengths.length < 3
        || validator.edgeLengths.some((edge) => !Number.isSafeInteger(edge) || edge <= 0)
      ) return false;
      const perimeter = validator.edgeLengths.reduce((sum, edge) => sum + edge, 0);
      return Number.isSafeInteger(perimeter) && perimeter === validator.expected;
    }
  }
}

export function validateRelativePosition(
  moving: { x: number; y: number; width: number; height: number },
  reference: { x: number; y: number; width: number; height: number },
  relation: SpatialRelation,
  clearance = 12,
): boolean {
  const values = [moving.x, moving.y, moving.width, moving.height, reference.x, reference.y, reference.width, reference.height, clearance];
  if (values.some((value) => !Number.isFinite(value)) || moving.width <= 0 || moving.height <= 0 || reference.width <= 0 || reference.height <= 0 || clearance < 0) return false;

  const horizontalOverlap = Math.abs(moving.x - reference.x) < (moving.width + reference.width) / 2;
  const verticalOverlap = Math.abs(moving.y - reference.y) < (moving.height + reference.height) / 2;
  if (horizontalOverlap && verticalOverlap) return false;

  switch (relation) {
    case "left":
      return moving.x + moving.width / 2 + clearance <= reference.x - reference.width / 2;
    case "right":
      return moving.x - moving.width / 2 - clearance >= reference.x + reference.width / 2;
    case "above":
      return moving.y + moving.height / 2 + clearance <= reference.y - reference.height / 2;
    case "below":
      return moving.y - moving.height / 2 - clearance >= reference.y + reference.height / 2;
  }
}

export const homeworkPrompts = [
  {
    kind: "recognition",
    icon: "👀",
    ru: "Найди дома два предмета. Покажи, какой из них слева от другого.",
    ky: "Үйдөн эки буюм тап. Кайсынысы экинчисинин сол жагында турганын көрсөт.",
  },
  {
    kind: "recognition",
    icon: "⬆️",
    ru: "Положи маленькую игрушку над книгой. Покажи это взрослому.",
    ky: "Кичинекей оюнчукту китептин үстүнө кой. Чоң кишиге көрсөт.",
  },
  {
    kind: "new-model",
    icon: "📦",
    ru: "Выбери другую пару безопасных предметов и поставь один справа от другого.",
    ky: "Коопсуз башка эки буюмду тандап, бирин экинчисинин оң жагына кой.",
  },
  {
    kind: "new-model",
    icon: "⬇️",
    ru: "Поставь карандаш под столом или рядом с ним так, чтобы он не мешал. Назови место.",
    ky: "Карандашты тоскоол болбогондой столдун алдына же жанына кой. Ордун ата.",
  },
  {
    kind: "explain",
    icon: "💬",
    ru: "Поменяй два предмета местами. Скажи, какое слово о положении изменилось и почему.",
    ky: "Эки буюмдун ордун алмаштыр. Кайсы жайгашуу сөзү өзгөргөнүн жана эмне үчүн экенин айт.",
  },
  {
    kind: "transfer",
    icon: "🏠",
    ru: "Вместе со взрослым выбери два предмета юрты или комнаты. Покажи «слева», «справа», «над» и «под».",
    ky: "Чоң киши менен боз үйдөн же бөлмөдөн эки буюм танда. «Солдо», «оңдо», «үстүндө» жана «астында» көрсөт.",
  },
] as const;

export function getAdaptiveHintLevel(attemptsAfterError: number): 1 | 2 | 3 {
  return Math.min(3, Math.max(1, attemptsAfterError)) as 1 | 2 | 3;
}

export function getSpatialHint(level: 1 | 2 | 3, language: "ru" | "ky"): string {
  const hints = {
    ru: [
      "Сначала найди коробку. От неё покажи направление, в котором должен оказаться мяч.",
      "Посмотри на маленькую схему-направление. Сравни её с местом коробки, а не с собой.",
      "Давай разберём похожий ход вместе: найди предмет-ориентир, проследи стрелку и снова попробуй на новом примере.",
    ],
    ky: [
      "Адегенде кутуну тап. Топ кайсы тарапта болушу керек экенин кутуга карап көрсөт.",
      "Кичинекей багыт схемасын кара. Өзүңө эмес, кутуга салыштыр.",
      "Окшош мисалды чогуу карайлы: багытты тап, анан жаңы мисалды аткарып көр.",
    ],
  };
  return hints[language][level - 1];
}

export interface SpatialMicrotestOption {
  value: string;
  label: { ru: string; ky: string };
}

export interface SpatialMicrotestQuestion {
  id: string;
  prompt: { ru: string; ky: string };
  options: SpatialMicrotestOption[];
  validator: MathValidator;
}

const choice = (
  value: string,
  ru: string,
  ky: string,
): SpatialMicrotestOption => ({ value, label: { ru, ky } });

const spatialMicrotest: SpatialMicrotestQuestion[] = [
  {
    id: "inverse-left-right",
    prompt: { ru: "Мяч слева от коробки. Где коробка относительно мяча?", ky: "Топ кутунун сол жагында. Куту топко карата кайсы жерде?" },
    options: [choice("left", "Слева", "Сол жагында"), choice("right", "Справа", "Оң жагында"), choice("above", "Над мячом", "Топтун үстүндө")],
    validator: { kind: "spatial-position", expected: "right" },
  },
  {
    id: "inverse-right-left",
    prompt: { ru: "Книга справа от чашки. Где чашка относительно книги?", ky: "Китеп чөйчөктүн оң жагында. Чөйчөк китепке карата кайсы жерде?" },
    options: [choice("left", "Слева", "Сол жагында"), choice("right", "Справа", "Оң жагында"), choice("below", "Под книгой", "Китептин астында")],
    validator: { kind: "spatial-position", expected: "left" },
  },
  {
    id: "inverse-above-below",
    prompt: { ru: "Коробка над мячом. Где мяч относительно коробки?", ky: "Куту топтун үстүндө. Топ кутуга карата кайсы жерде?" },
    options: [choice("above", "Над коробкой", "Кутунун үстүндө"), choice("below", "Под коробкой", "Кутунун астында"), choice("right", "Справа", "Оң жагында")],
    validator: { kind: "spatial-position", expected: "below" },
  },
  {
    id: "inverse-below-above",
    prompt: { ru: "Карандаш под книгой. Где книга относительно карандаша?", ky: "Карандаш китептин астында. Китеп карандашка карата кайсы жерде?" },
    options: [choice("above", "Над карандашом", "Карандаштын үстүндө"), choice("below", "Под карандашом", "Карандаштын астында"), choice("left", "Слева", "Сол жагында")],
    validator: { kind: "spatial-position", expected: "above" },
  },
  {
    id: "left-chain",
    prompt: { ru: "Дерево слева от скамейки. Что находится справа от дерева?", ky: "Дарак отургучтун сол жагында. Дарактын оң жагында эмне бар?" },
    options: [choice("bench", "Скамейка", "Отургуч"), choice("tree", "Дерево", "Дарак"), choice("ball", "Мяч", "Топ")],
    validator: { kind: "choice-equality", expected: "bench" },
  },
  {
    id: "right-chain",
    prompt: { ru: "Флажок справа от коробки. Что находится слева от флажка?", ky: "Желекче кутунун оң жагында. Желекченин сол жагында эмне бар?" },
    options: [choice("flag", "Флажок", "Желекче"), choice("box", "Коробка", "Куту"), choice("above", "Предмет над коробкой", "Кутунун үстүндөгү буюм")],
    validator: { kind: "choice-equality", expected: "box" },
  },
  {
    id: "between-relations",
    prompt: { ru: "Лампа слева от стола, а мяч справа от стола. Что находится между лампой и мячом?", ky: "Чырак үстөлдүн сол жагында, топ оң жагында. Чырак менен топтун ортосунда эмне бар?" },
    options: [choice("lamp", "Лампа", "Чырак"), choice("table", "Стол", "Үстөл"), choice("ball", "Мяч", "Топ")],
    validator: { kind: "choice-equality", expected: "table" },
  },
  {
    id: "vertical-chain",
    prompt: { ru: "Полка над столом, а чашка под столом. Что выше чашки?", ky: "Текче үстөлдүн үстүндө, чөйчөк үстөлдүн астында. Чөйчөктөн жогору эмне?" },
    options: [choice("table", "Стол", "Үстөл"), choice("cup", "Чашка", "Чөйчөк"), choice("shelf", "Полка", "Текче")],
    validator: { kind: "choice-equality", expected: "shelf" },
  },
  {
    id: "two-relations",
    prompt: { ru: "Мяч ниже коробки, а коробка ниже полки. Какой предмет самый высокий?", ky: "Топ кутудан төмөн, куту текчеден төмөн. Эң бийик турган буюм кайсы?" },
    options: [choice("ball", "Мяч", "Топ"), choice("box", "Коробка", "Куту"), choice("shelf", "Полка", "Текче")],
    validator: { kind: "choice-equality", expected: "shelf" },
  },
  {
    id: "reference-matters",
    prompt: { ru: "Стул стоит слева от стола. А стол относительно стула находится…", ky: "Отургуч үстөлдүн сол жагында. Отургучка карата үстөл кайсы жерде?" },
    options: [choice("left", "Слева", "Сол жагында"), choice("right", "Справа", "Оң жагында"), choice("above", "Над стулом", "Отургучтун үстүндө")],
    validator: { kind: "spatial-position", expected: "right" },
  },
];

export function createSpatialMicrotest(round = 0): SpatialMicrotestQuestion[] {
  const offset = Math.abs(Math.trunc(round)) % spatialMicrotest.length;
  const mirror = round % 3 === 1 ? "horizontal" : round % 3 === 2 ? "vertical" : null;
  const invert = (value: string): string => {
    if (mirror === "horizontal") return value === "left" ? "right" : value === "right" ? "left" : value;
    if (mirror === "vertical") return value === "above" ? "below" : value === "below" ? "above" : value;
    return value;
  };
  const swapPhrases = (value: string, first: string, second: string, firstTitle: string, secondTitle: string) => (
    value
      .replaceAll(firstTitle, "\u0000")
      .replaceAll(secondTitle, firstTitle)
      .replaceAll("\u0000", secondTitle)
      .replaceAll(first, "\u0001")
      .replaceAll(second, first)
      .replaceAll("\u0001", second)
  );
  const transformText = (value: string, language: "ru" | "ky") => {
    if (mirror === "horizontal") {
      return language === "ru"
        ? swapPhrases(value, "слева", "справа", "Слева", "Справа")
        : swapPhrases(value, "сол жагында", "оң жагында", "Сол жагында", "Оң жагында");
    }
    if (mirror === "vertical") {
      return language === "ru"
        ? swapPhrases(value, "над", "под", "Над", "Под")
        : swapPhrases(value, "үстүндө", "астында", "Үстүндө", "Астында");
    }
    return value;
  };
  const ordered = [...spatialMicrotest.slice(offset), ...spatialMicrotest.slice(0, offset)];

  return ordered.map((question, index) => ({
    ...question,
    id: `spatial-r${round + 1}-${question.id}`,
    prompt: {
      ru: transformText(question.prompt.ru, "ru"),
      ky: transformText(question.prompt.ky, "ky"),
    },
    options: question.options.map((option) => ({
      ...option,
      value: invert(option.value),
      label: {
        ru: transformText(option.label.ru, "ru"),
        ky: transformText(option.label.ky, "ky"),
      },
    })).sort((left, right) => {
      const leftWeight = (spatialMicrotest.findIndex((item) => item.id === question.id) + offset + left.value.length + index) % 3;
      const rightWeight = (spatialMicrotest.findIndex((item) => item.id === question.id) + offset + right.value.length + index) % 3;
      return leftWeight - rightWeight;
    }),
    validator: question.validator.kind === "spatial-position"
      ? { ...question.validator, expected: invert(question.validator.expected) as SpatialRelation }
      : question.validator,
  }));
}
