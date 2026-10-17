import type { CurriculumTopic, LessonSlot, TopicFamily } from "@/lib/curriculum";

export type LocalizedText = { ru: string; ky: string };

export interface PracticeOption extends LocalizedText {
  value: string;
}

export interface PracticeTask {
  id: string;
  kind: "choice" | "number";
  prompt: LocalizedText;
  options?: PracticeOption[];
  answer: string;
  hint: LocalizedText;
  explanation: LocalizedText;
  visual?: string;
}

const text = (ru: string, ky: string): LocalizedText => ({ ru, ky });
const option = (value: string | number, ru?: string, ky?: string): PracticeOption => ({
  value: String(value),
  ru: ru ?? String(value),
  ky: ky ?? ru ?? String(value),
});

function numberSeed(slot: LessonSlot, index: number, salt = 0): number {
  const raw = slot.grade * 997 + slot.topic.sourceOrder * 131 + slot.part * 43 + index * 17 + salt;
  return Math.abs((raw * 9301 + 49297) % 233280);
}

function shuffledNumberOptions(answer: number, spread: number, seed: number): PracticeOption[] {
  const values = new Set<number>([answer]);
  const candidates = [answer - spread, answer + spread, answer + 1, answer - 1, answer + 2, answer - 2]
    .filter((value) => value >= 0);
  for (const candidate of candidates) {
    if (values.size >= 3) break;
    values.add(candidate);
  }
  const array = [...values].slice(0, 3);
  const rotation = seed % array.length;
  return [...array.slice(rotation), ...array.slice(0, rotation)].map((value) => option(value));
}

function arithmeticTask(slot: LessonSlot, index: number): PracticeTask {
  const max = slot.grade === 1 ? 20 : 100;
  const seed = numberSeed(slot, index);
  const addition = index % 2 === 0;
  let a = 2 + (seed % Math.max(3, Math.floor(max / 2)));
  let b = 1 + ((seed >> 2) % Math.max(2, Math.floor(max / 3)));
  if (a + b > max) b = Math.max(1, max - a);
  if (!addition && b > a) [a, b] = [b, a];
  const answer = addition ? a + b : a - b;
  const sign = addition ? "+" : "−";
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: index % 3 === 0 ? "number" : "choice",
    prompt: text(`Вычисли: ${a} ${sign} ${b}`, `Эсепте: ${a} ${sign} ${b}`),
    options: shuffledNumberOptions(answer, Math.max(1, b), seed),
    answer: String(answer),
    hint: text(
      addition
        ? `Начни с ${a} и считай вперёд ${b} шага. Последнее названное число будет ответом.`
        : `Начни с ${a} и отсчитай назад ${b} шага. Посчитай, на каком числе остановишься.`,
      addition
        ? `${a} санынан баштап алдыга ${b} кадам сана. Акыркы сан жооп болот.`
        : `${a} санынан баштап артка ${b} кадам сана. Кайсы санга токтогонуңду айт.`,
    ),
    explanation: text(`${a} ${sign} ${b} = ${answer}.`, `${a} ${sign} ${b} = ${answer}.`),
  };
}

function numberTask(slot: LessonSlot, index: number): PracticeTask {
  const max = slot.grade === 1 ? 20 : 100;
  const seed = numberSeed(slot, index);
  const n = 2 + (seed % (max - 3));
  const mode = index % 4;
  if (mode === 0) {
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "choice",
      prompt: text(`Какое число идёт сразу после ${n}?`, `${n} санынан кийин кайсы сан келет?`),
      options: shuffledNumberOptions(n + 1, 2, seed),
      answer: String(n + 1),
      hint: text(`Назови числа по порядку: ${n}, затем сделай один шаг вперёд. Какое число будет следующим?`, `Сандарды ирети менен айт: ${n}, анан бир кадам алдыга жыл. Кийинки сан кайсы?`),
      explanation: text(`После ${n} идёт ${n + 1}.`, `${n} санынан кийин ${n + 1} келет.`),
    };
  }
  if (mode === 1) {
    const even = n % 2 === 0;
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "choice",
      prompt: text(`Число ${n} чётное или нечётное?`, `${n} саны жуппу же такпы?`),
      options: [option("even", "Чётное", "Жуп"), option("odd", "Нечётное", "Так")],
      answer: even ? "even" : "odd",
      hint: text(`Представь ${n} предметов и разложи их по парам. Если ни одного не осталось, число чётное.`, `${n} буюмду жуп-жубу менен бөлүштүрүп көр. Эч нерсе артпаса, сан жуп болот.`),
      explanation: text(even ? `${n} делится на 2 без остатка.` : `После деления ${n} на 2 остаётся один.`, even ? `${n} саны 2ге калдыксыз бөлүнөт.` : `${n} санын 2ге бөлгөндө бирөө калат.`),
    };
  }
  if (mode === 2 && slot.grade === 2) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "number",
      prompt: text(`Сколько единиц в числе ${n}?`, `${n} санында канча бирдик бар?`),
      answer: String(ones),
      hint: text(`В числе ${n} единицы стоят справа. Какая цифра стоит на последнем месте?`, `${n} санындагы бирдиктер оң жакта турат. Эң акыркы орунда кайсы цифра бар?`),
      explanation: text(`${n} — это ${tens} дес. и ${ones} ед.`, `${n} — бул ${tens} онд. жана ${ones} бирд.`),
    };
  }
  const other = Math.max(0, n - (1 + (seed % 5)));
  const answer = n > other ? ">" : n < other ? "<" : "=";
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`Выбери знак: ${n} □ ${other}`, `Белгини танда: ${n} □ ${other}`),
    options: [option(">"), option("<"), option("=")],
    answer,
    hint: text(`Представь ${n} и ${other} на числовом ряду. Число правее — больше.`, `${n} жана ${other} сандарын сан катарында элестет. Оң жактагы сан чоң болот.`),
    explanation: text(`${n} ${answer} ${other}.`, `${n} ${answer} ${other}.`),
  };
}

function multiplicationTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const groups = 2 + (seed % 5);
  const each = 2 + ((seed >> 3) % 5);
  const product = groups * each;
  const askDivision = index % 2 === 1;
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: index % 3 === 0 ? "number" : "choice",
    prompt: askDivision
      ? text(`${product} предметов разделили поровну на ${groups} групп. Сколько в каждой?`, `${product} буюмду ${groups} топко тең бөлүштү. Ар биринде канчадан?`)
      : text(`В ${groups} одинаковых группах по ${each} предмета. Сколько всего?`, `${groups} бирдей топтун ар биринде ${each} буюм бар. Баары канча?`),
    options: shuffledNumberOptions(askDivision ? each : product, groups, seed),
    answer: String(askDivision ? each : product),
    hint: text(
      askDivision
        ? `Нужно разложить ${product} предметов в ${groups} одинаковые группы. Раздай по одному в каждую группу, пока предметы не закончатся.`
        : `Нарисуй ${groups} кружка и положи в каждый по ${each} точки. Сосчитай точки по ${each}.`,
      askDivision
        ? `${product} буюмду ${groups} бирдей топко бөл. Буюмдар бүткөнгө чейин ар бир топко бирден тарат.`
        : `${groups} тегерек чийип, ар бирине ${each} чекиттен кой. Чекиттерди ${each}тен сана.`,
    ),
    explanation: text(`${groups} × ${each} = ${product}.`, `${groups} × ${each} = ${product}.`),
    visual: Array.from({ length: groups }, () => "●".repeat(each)).join("   "),
  };
}

function fractionTask(slot: LessonSlot, index: number): PracticeTask {
  const quarters = index % 2 === 1;
  const total = quarters ? 4 : 2;
  const nameRu = quarters ? "четверть" : "половина";
  const nameKy = quarters ? "төрттөн бир" : "жарым";
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`На сколько равных частей нужно разделить целое, чтобы получить ${nameRu}?`, `${nameKy} алуу үчүн бүтүндү канча тең бөлүккө бөлүү керек?`),
    options: [option(2), option(3), option(4)].sort((a, b) => (numberSeed(slot, index) % 2 ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value))),
    answer: String(total),
    hint: text(
      quarters ? "Четверть — одна часть, если целое разрезали на 4 одинаковые части. Сосчитай, сколько частей нужно." : "Половина — одна часть из двух одинаковых. Представь, что разрезаешь целое пополам.",
      quarters ? "Төрттөн бир — бүтүндү 4 бирдей бөлүккө бөлгөндөгү бир бөлүк. Канча бөлүк керек экенин сана." : "Жарым — эки бирдей бөлүктүн бири. Бүтүндү тең экиге бөлгөнүңдү элестет.",
    ),
    explanation: text(quarters ? "Четверть — одна из четырёх равных частей." : "Половина — одна из двух равных частей.", quarters ? "Төрттөн бир — төрт тең бөлүктүн бири." : "Жарым — эки тең бөлүктүн бири."),
    visual: quarters ? "◧  →  ◱ ◱ ◱ ◱" : "◧  →  ◩ ◪",
  };
}

function geometryTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const sideA = 2 + (seed % 6);
  const sideB = 2 + ((seed >> 3) % 5);
  const mode = index % 3;
  if (mode === 0) {
    const perimeter = 2 * (sideA + sideB);
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "number",
      prompt: text(`У прямоугольника стороны ${sideA} см и ${sideB} см. Найди периметр.`, `Тик бурчтуктун жактары ${sideA} см жана ${sideB} см. Периметрин тап.`),
      answer: String(perimeter),
      hint: text(`Периметр — это путь вокруг прямоугольника. Сложи по очереди: ${sideA} + ${sideB} + ${sideA} + ${sideB}.`, `Периметр — тик бурчтукту айланып өткөн жол. Жактарын кош: ${sideA} + ${sideB} + ${sideA} + ${sideB}.`),
      explanation: text(`${sideA} + ${sideB} + ${sideA} + ${sideB} = ${perimeter} см.`, `${sideA} + ${sideB} + ${sideA} + ${sideB} = ${perimeter} см.`),
      visual: "▭",
    };
  }
  const sides = 3 + (seed % 4);
  const names = sides === 3 ? ["Треугольник", "Үч бурчтук"] : sides === 4 ? ["Четырёхугольник", "Төрт бурчтук"] : sides === 5 ? ["Пятиугольник", "Беш бурчтук"] : ["Шестиугольник", "Алты бурчтук"];
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`Как называется фигура с ${sides} сторонами?`, `${sides} жагы бар фигура кандай аталат?`),
    options: [option("target", names[0], names[1]), option("circle", "Круг", "Тегерек"), option("line", "Отрезок", "Кесинди")],
    answer: "target",
    hint: text(`Проведи пальцем по контуру и считай прямые стороны вслух: по одной за раз.`, `Фигуранын четин манжаң менен бойлой жүрүп, түз жактарын бирден сана.`),
    explanation: text(`${names[0]} имеет ${sides} стороны.`, `${names[1]}та ${sides} жак бар.`),
    visual: sides === 3 ? "△" : sides === 4 ? "□" : sides === 5 ? "⬠" : "⬡",
  };
}

function measurementTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const mode = index % 4;
  if (mode === 0) {
    const cm = 2 + (seed % 12);
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "number",
      prompt: text(`Отрезок начинается у отметки 1 см и заканчивается у ${cm + 1} см. Какова длина?`, `Кесинди 1 см белгисинен башталып, ${cm + 1} см белгисинде бүтөт. Узундугу канча?`),
      answer: String(cm),
      hint: text(`Посмотри на линейку: отрезок начинается на 1 см и заканчивается на ${cm + 1} см. Посчитай деления между этими отметками.`, `Сызгычты кара: кесинди 1 смден башталып, ${cm + 1} смде бүтөт. Эки белгинин ортосундагы бөлүктөрдү сана.`),
      explanation: text(`${cm + 1} − 1 = ${cm} см.`, `${cm + 1} − 1 = ${cm} см.`),
    };
  }
  if (mode === 1) {
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "choice",
      prompt: text("Чем удобнее измерить длину карандаша?", "Карандаштын узундугун эмне менен өлчөө ыңгайлуу?"),
      options: [option("cm", "Сантиметрами", "Сантиметр менен"), option("kg", "Килограммами", "Килограмм менен"), option("hour", "Часами", "Саат менен")],
      answer: "cm",
      hint: text("Карандаш длинный или тяжёлый? Длину измеряют сантиметрами, а килограммами — массу.", "Карандаштын узундугун же салмагын өлчөйбүзбү? Узундукту сантиметр, массаны килограмм менен өлчөйбүз."),
      explanation: text("Длину небольших предметов измеряют в сантиметрах.", "Кичинекей буюмдардын узундугун сантиметр менен өлчөйбүз."),
    };
  }
  if (mode === 2) {
    const price = 5 + (seed % 20);
    return {
      id: `${slot.id}-q${index + 1}`,
      kind: "number",
      prompt: text(`Тетрадь стоит ${price} сомов. Дали ${price + 10}. Сколько сдачи?`, `Дептер ${price} сом турат. ${price + 10} сом берилди. Кайтарым канча?`),
      answer: "10",
      hint: text(`Сравни, сколько дали (${price + 10}) и сколько стоит тетрадь (${price}). Найди, сколько осталось после оплаты.`, `Берилген акчаны (${price + 10}) дептердин баасы (${price}) менен салыштыр. Төлөгөндөн кийин канча калганын тап.`),
      explanation: text(`${price + 10} − ${price} = 10 сомов.`, `${price + 10} − ${price} = 10 сом.`),
    };
  }
  const temp = 5 + (seed % 20);
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`На термометре ${temp} °C. Стало на 2 °C теплее. Какая температура?`, `Термометрде ${temp} °C. 2 °Cге жылуу болду. Температура канча?`),
    options: shuffledNumberOptions(temp + 2, 2, seed),
    answer: String(temp + 2),
    hint: text(`Столбик термометра поднялся: начни с ${temp} и посчитай ещё 2 деления вверх.`, `Термометрдин көрсөткүчү жогорулады: ${temp}тен баштап, өйдө карай дагы 2 бөлүк сана.`),
    explanation: text(`${temp} + 2 = ${temp + 2} °C.`, `${temp} + 2 = ${temp + 2} °C.`),
  };
}

function dataTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const apples = 2 + (seed % 6);
  const pears = 1 + ((seed >> 3) % 5);
  const moreApples = apples >= pears;
  const answer = moreApples ? "apples" : "pears";
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`В таблице: яблок — ${apples}, груш — ${pears}. Чего больше?`, `Таблицада: алма — ${apples}, алмурут — ${pears}. Кайсысы көп?`),
    options: [option("apples", "Яблок", "Алма"), option("pears", "Груш", "Алмурут"), option("equal", "Поровну", "Тең")],
    answer: apples === pears ? "equal" : answer,
    hint: text(`Сравни ${apples} яблок и ${pears} груш: можно представить по одному предмету в каждой паре. Где останется больше?`, `${apples} алма менен ${pears} алмурутту салыштыр: экөөнөн бирден жуп түз. Кайсынысы көбүрөөк калат?`),
    explanation: apples === pears
      ? text(`Количество одинаковое: ${apples} и ${pears}.`, `Саны бирдей: ${apples} жана ${pears}.`)
      : text(`${Math.max(apples, pears)} больше, чем ${Math.min(apples, pears)}.`, `${Math.max(apples, pears)} саны ${Math.min(apples, pears)} санынан чоң.`),
    visual: `🍎 ${"●".repeat(apples)}\n🍐 ${"●".repeat(pears)}`,
  };
}

function equationTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const answer = 2 + (seed % (slot.grade === 1 ? 9 : 15));
  const add = 1 + ((seed >> 3) % 9);
  const sum = answer + add;
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: index % 2 === 0 ? "number" : "choice",
    prompt: text(`Найди неизвестное: □ + ${add} = ${sum}`, `Белгисиз санды тап: □ + ${add} = ${sum}`),
    options: shuffledNumberOptions(answer, add, seed),
    answer: String(answer),
    hint: text(`Представь равенство как весы. Чтобы найти □ в □ + ${add} = ${sum}, начни с ${sum} и убери ${add}.`, `Барабардыкты тараза деп элестет. □ + ${add} = ${sum} теңдемесинде □ ни табуу үчүн ${sum} ден ${add} ни кемит.`),
    explanation: text(`${sum} − ${add} = ${answer}.`, `${sum} − ${add} = ${answer}.`),
  };
}

function expressionTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const a = 4 + (seed % (slot.grade === 1 ? 8 : 20));
  const b = 1 + ((seed >> 2) % 6);
  const c = 1 + ((seed >> 4) % 5);
  const answer = index % 2 === 0 ? a + b - c : a + (b + c);
  const expression = index % 2 === 0 ? `${a} + ${b} − ${c}` : `${a} + (${b} + ${c})`;
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "number",
    prompt: text(`Найди значение: ${expression}`, `Маанисин тап: ${expression}`),
    answer: String(answer),
    hint: text(
      index % 2 === 0
        ? `Здесь нет скобок: начни с ${a}, прибавь ${b}, затем отними ${c}. Записывай ответ после каждого шага.`
        : `Сначала сложи числа в скобках: ${b} + ${c}. Потом прибавь получившееся число к ${a}.`,
      index % 2 === 0
        ? `Кашаа жок: ${a} санынан баштап, ${b} ни кош, анан ${c} ни кемит. Ар бир кадамдан кийин жоопту жаз.`
        : `Адегенде кашаанын ичиндеги сандарды кош: ${b} + ${c}. Андан кийин чыккан санды ${a} га кош.`,
    ),
    explanation: text(`${expression} = ${answer}.`, `${expression} = ${answer}.`),
  };
}

function wordProblemTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const start = 3 + (seed % (slot.grade === 1 ? 9 : 25));
  const change = 1 + ((seed >> 3) % Math.max(2, Math.min(8, start)));
  const add = index % 2 === 0;
  const answer = add ? start + change : start - change;
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: index % 3 === 0 ? "choice" : "number",
    prompt: add
      ? text(`У Айым было ${start} наклеек. Ей подарили ещё ${change}. Сколько стало?`, `Айымда ${start} чаптама бар эле. Ага дагы ${change} чаптама беришти. Баары канча болду?`)
      : text(`У Айым было ${start} наклеек. ${change} она подарила. Сколько осталось?`, `Айымда ${start} чаптама бар эле. Ал ${change} чаптаманы белек кылды. Канча калды?`),
    options: shuffledNumberOptions(answer, change, seed),
    answer: String(answer),
    hint: text(
      add
        ? `Наклеек было ${start}. Нарисуй ещё ${change} новых наклеек рядом и сосчитай все вместе.`
        : `Нарисуй ${start} наклеек и зачеркни ${change}, которые подарили. Сосчитай незачёркнутые.`,
      add
        ? `${start} чаптама бар эле. Жанына дагы ${change} чаптаманы чийип, баарын кошуп сана.`
        : `${start} чаптаманы чийип, белек кылынган ${change} чаптаманы чийип сал. Калганын сана.`,
    ),
    explanation: text(`${start} ${add ? "+" : "−"} ${change} = ${answer}.`, `${start} ${add ? "+" : "−"} ${change} = ${answer}.`),
  };
}

function shapeTask(slot: LessonSlot, index: number): PracticeTask {
  const entries = [
    { value: "circle", visual: "●", ru: "круг", ky: "тегерек", propertyRu: "нет углов", propertyKy: "бурчу жок" },
    { value: "triangle", visual: "▲", ru: "треугольник", ky: "үч бурчтук", propertyRu: "три стороны", propertyKy: "үч жагы бар" },
    { value: "square", visual: "■", ru: "квадрат", ky: "квадрат", propertyRu: "четыре равные стороны", propertyKy: "төрт тең жагы бар" },
  ] as const;
  const target = entries[numberSeed(slot, index) % entries.length];
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`Какая фигура имеет свойство: ${target.propertyRu}?`, `Кайсы фигуранын мындай касиети бар: ${target.propertyKy}?`),
    options: entries.map((entry) => option(entry.value, entry.ru, entry.ky)),
    answer: target.value,
    hint: text(`Посмотри на фигуру и посчитай ${target.propertyRu === "нет углов" ? "углы" : "стороны"}. Какой вариант имеет такой признак?`, `Фигураны карап, ${target.propertyKy === "бурчу жок" ? "бурчтарын" : "жактарын"} сана. Кайсы фигурада ушундай белги бар?`),
    explanation: text(`${target.ru[0].toUpperCase()}${target.ru.slice(1)}: ${target.propertyRu}.`, `${target.ky[0].toUpperCase()}${target.ky.slice(1)}: ${target.propertyKy}.`),
    visual: entries.map((entry) => entry.visual).join("   "),
  };
}

function sortingTask(slot: LessonSlot, index: number): PracticeTask {
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`По какому признаку собраны вместе: 🔵 🔷 🔹?`, `🔵 🔷 🔹 эмнеси боюнча бир топко чогултулган?`),
    options: [option("color", "По цвету", "Түсү боюнча"), option("shape", "По форме", "Формасы боюнча"), option("size", "По размеру", "Өлчөмү боюнча")],
    answer: "color",
    hint: text("Посмотри только на цвет каждой фигуры. Неважно, какой у неё формы или размера: все три синие.", "Ар бир фигуранын түсүн гана кара. Формасы же өлчөмү маанилүү эмес: үчөө тең көк."),
    explanation: text("Фигуры разной формы и размера, но все синие.", "Фигуралардын формасы жана өлчөмү ар башка, бирок баары көк."),
  };
}

function spatialTask(slot: LessonSlot, index: number): PracticeTask {
  const relations = [
    { value: "left", ru: "слева", ky: "сол жагында", oppositeRu: "справа", oppositeKy: "оң жагында" },
    { value: "above", ru: "над", ky: "үстүндө", oppositeRu: "под", oppositeKy: "астында" },
    { value: "front", ru: "перед", ky: "алдында", oppositeRu: "за", oppositeKy: "артында" },
  ] as const;
  const relation = relations[numberSeed(slot, index) % relations.length];
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`Мяч находится ${relation.ru} коробки. Где коробка относительно мяча?`, `Топ кутунун ${relation.ky}. Куту топко карата кайда?`),
    options: [option("opposite", relation.oppositeRu, relation.oppositeKy), option("same", relation.ru, relation.ky), option("inside", "внутри", "ичинде")],
    answer: "opposite",
    hint: text(`Мяч находится ${relation.ru} коробки. Представь, что теперь смотришь из точки мяча на коробку: назови противоположную сторону.`, `Топ кутунун ${relation.ky}. Эми топ турган жерден кутуну карап, карама-каршы жагын ата.`),
    explanation: text(`Если мяч ${relation.ru} коробки, коробка ${relation.oppositeRu} мяча.`, `Эгер топ кутунун ${relation.ky} болсо, куту топтун ${relation.oppositeKy}.`),
    visual: "⚽   ▣",
  };
}

function symmetryTask(slot: LessonSlot, index: number): PracticeTask {
  const symmetric = index % 2 === 0;
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt: text(`Можно ли провести вертикальную линию симметрии у фигуры ${symmetric ? "♥" : "◢"}?`, `${symmetric ? "♥" : "◢"} фигурасында тик симметрия сызыгын өткөрүүгө болобу?`),
    options: [option("yes", "Да", "Ооба"), option("no", "Нет", "Жок")],
    answer: symmetric ? "yes" : "no",
    hint: text("Проведи воображаемую линию по центру и сложи фигуру по ней. Совпадут ли левая и правая половины?", "Ортосунан сызык өткөрүп, фигураны ошол сызык боюнча бүктө. Сол жана оң бөлүктөрү дал келеби?"),
    explanation: text(symmetric ? "Левая и правая половины совпадут." : "Половины не совпадут.", symmetric ? "Сол жана оң жарымы дал келет." : "Жарымдары дал келбейт."),
    visual: symmetric ? "♥" : "◢",
  };
}

function taskForFamily(family: TopicFamily, slot: LessonSlot, index: number): PracticeTask {
  switch (family) {
    case "numbers":
    case "estimate":
    case "number-line":
    case "place-value":
      return numberTask(slot, index);
    case "arithmetic":
      return arithmeticTask(slot, index);
    case "multiplication":
    case "groups":
      return multiplicationTask(slot, index);
    case "fractions":
      return fractionTask(slot, index);
    case "geometry":
      return geometryTask(slot, index);
    case "measurement":
      return measurementTask(slot, index);
    case "data":
      return dataTask(slot, index);
    case "equations":
      return equationTask(slot, index);
    case "expressions":
      return expressionTask(slot, index);
    case "word-problems":
      return wordProblemTask(slot, index);
    case "shapes":
      return shapeTask(slot, index);
    case "sorting":
      return sortingTask(slot, index);
    case "symmetry":
      return symmetryTask(slot, index);
    case "spatial":
      return spatialTask(slot, index);
  }
}

export function createPracticeTasks(slot: LessonSlot): PracticeTask[] {
  return Array.from({ length: 6 }, (_, index) => taskForFamily(slot.topic.family, slot, index));
}

export function topicObjective(topic: CurriculumTopic): LocalizedText {
  const objectives: Record<TopicFamily, LocalizedText> = {
    spatial: text("Уверенно описывать положение и направление объектов.", "Объекттердин жайгашуусун жана багытын ишенимдүү сүрөттөө."),
    shapes: text("Распознавать фигуры по их признакам.", "Фигураларды белгилери боюнча таануу."),
    sorting: text("Сравнивать и объединять объекты по заданному признаку.", "Объекттерди берилген белги боюнча салыштыруу жана топтоо."),
    numbers: text("Читать, записывать, сравнивать и упорядочивать числа.", "Сандарды окуу, жазуу, салыштыруу жана иреттөө."),
    estimate: text("Оценивать количество и проверять результат счётом.", "Санды болжолдоо жана саноо менен текшерүү."),
    arithmetic: text("Понимать смысл вычисления и объяснять способ.", "Эсептөөнүн маанисин түшүнүү жана ыкмасын түшүндүрүү."),
    groups: text("Моделировать равные группы и их общее количество.", "Бирдей топторду жана алардын жалпы санын моделдөө."),
    "number-line": text("Размещать и сравнивать числа на числовом луче.", "Сандарды сан нурунда жайгаштыруу жана салыштыруу."),
    "place-value": text("Разбирать число на десятки и единицы.", "Санды ондуктарга жана бирдиктерге ажыратуу."),
    "word-problems": text("Выбирать действие по смыслу задачи и проверять ответ.", "Маселенин маанисине жараша амалды тандап, жоопту текшерүү."),
    measurement: text("Выбирать величину, единицу и выполнять вычисления.", "Чоңдукту, бирдикти тандап, эсептөөлөрдү аткаруу."),
    data: text("Читать, группировать и представлять данные.", "Маалыматты окуу, топтоо жана көрсөтүү."),
    fractions: text("Понимать равные части целого.", "Бүтүндүн тең бөлүктөрүн түшүнүү."),
    geometry: text("Исследовать свойства фигур, длину и периметр.", "Фигуралардын касиеттерин, узундукту жана периметрди изилдөө."),
    expressions: text("Соблюдать порядок действий и сравнивать значения.", "Амалдардын тартибин сактоо жана маанилерди салыштыруу."),
    equations: text("Находить неизвестное обратным действием.", "Белгисизди тескери амал менен табуу."),
    multiplication: text("Связывать умножение, деление и равные группы.", "Көбөйтүү, бөлүү жана бирдей топторду байланыштыруу."),
    symmetry: text("Находить линию симметрии и проверять совпадение частей.", "Симметрия сызыгын табуу жана бөлүктөрдүн дал келишин текшерүү."),
  };
  return objectives[topic.family];
}
