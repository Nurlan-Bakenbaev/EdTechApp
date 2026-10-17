import type { CurriculumTopic, LessonSlot, TopicFamily } from "@/lib/curriculum";

export type LocalizedText = { ru: string; ky: string };

export interface PracticeOption extends LocalizedText {
  value: string;
}

function numberLineTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const start = 2 + seed % 8;
  const moveRight = index % 2 === 0;
  const steps = 1 + ((seed >> 3) % (moveRight ? 5 : start - 1));
  const answer = moveRight ? start + steps : start - steps;
  const direction = moveRight ? "вправо" : "влево";
  const directionKy = moveRight ? "оңго" : "солго";
  return makeChoiceTask(
    slot,
    index,
    text(`Начни с ${start} и сделай ${steps} шага ${direction}. На каком числе окажешься?`, `${start} санынан баштап ${steps} кадам ${directionKy} жыл. Кайсы санга келесиң?`),
    shuffledNumberOptions(answer, steps, seed),
    String(answer),
    text(moveRight ? "При движении вправо числа увеличиваются." : "При движении влево числа уменьшаются.", moveRight ? "Оңго жылганда сандар чоңоёт." : "Солго жылганда сандар кичирейет."),
    text(`${start} ${moveRight ? "+" : "−"} ${steps} = ${answer}.`, `${start} ${moveRight ? "+" : "−"} ${steps} = ${answer}.`),
    `${start} ─ ${moveRight ? "→" : "←"} ${steps} ─ ?`,
  );
}

export type LessonFruit = "apple" | "pear" | "banana" | "orange" | "strawberry";

export interface FruitGroup {
  fruit: LessonFruit;
  count: number;
  groupCount?: number;
  label?: LocalizedText;
}

function inverseWordProblemTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const start = 4 + seed % 10;
  const change = 1 + ((seed >> 3) % 8);
  const total = start + change;
  const findStart = index % 2 === 0;
  const prompt = findStart
    ? text(`После того как добавили ${change} яблока, стало ${total}. Сколько яблок было сначала?`, `${change} алма кошулгандан кийин ${total} болду. Башында канча алма бар эле?`)
    : text(`Было ${total} яблок. После того как несколько отдали, осталось ${start}. Сколько отдали?`, `${total} алма бар эле. Бир нечесин бергенден кийин ${start} калды. Канча алма берилди?`);
  const answer = findStart ? start : change;
  return {
    ...makeNumberTask(
      slot,
      index,
      prompt,
      answer,
      text(findStart ? `От общего количества ${total} отними добавленные ${change}.` : `Сравни исходное количество ${total} и оставшееся ${start}.`, findStart ? `Жалпы ${total} сандан кошулган ${change} санын кемит.` : `Баштапкы ${total} жана калган ${start} сандарын салыштыр.`),
      text(findStart ? `${total} − ${change} = ${answer}.` : `${total} − ${start} = ${answer}.`, findStart ? `${total} − ${change} = ${answer}.` : `${total} − ${start} = ${answer}.`),
      `🍎　?　+　${change}　=　${total}`,
    ),
    fruitGroups: [{ fruit: "apple", count: total, label: text("Всего", "Бардыгы") }],
  };
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
  fruitGroups?: FruitGroup[];
}

function inverseOperationTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const first = 2 + seed % 10;
  const second = 2 + ((seed >> 3) % 8);
  const operation = index % 6;
  const promptData = [
    { prompt: text(`□ + ${second} = ${first + second}. Найди слагаемое.`, `□ + ${second} = ${first + second}. Кошулуучуну тап.`), answer: first, hint: text(`Из суммы ${first + second} вычти известное слагаемое ${second}.`, `Суммадан ${first + second} белгилүү ${second} кошулуучуну кемит.`) },
    { prompt: text(`${first + second} − □ = ${first}. Найди вычитаемое.`, `${first + second} − □ = ${first}. Кемитүүчүнү тап.`), answer: second, hint: text("Неизвестное вычитаемое найди как разность уменьшаемого и разности.", "Белгисиз кемитүүчүнү кемүүчү менен айырманын айырмасы аркылуу тап.") },
    { prompt: text(`□ − ${second} = ${first}. Найди уменьшаемое.`, `□ − ${second} = ${first}. Кемүүчүнү тап.`), answer: first + second, hint: text("Чтобы найти уменьшаемое, сложи разность и вычитаемое.", "Кемүүчүнү табуу үчүн айырма менен кемитүүчүнү кош.") },
    { prompt: text(`□ × ${second} = ${first * second}. Найди неизвестный множитель.`, `□ × ${second} = ${first * second}. Белгисиз көбөйткүчтү тап.`), answer: first, hint: text(`Раздели произведение ${first * second} на известный множитель ${second}.`, `Көбөйтүндү ${first * second} санын белгилүү ${second} көбөйткүчүнө бөл.`) },
    { prompt: text(`${first} × □ = ${first * second}. Найди неизвестный множитель.`, `${first} × □ = ${first * second}. Белгисиз көбөйткүчтү тап.`), answer: second, hint: text(`Раздели произведение ${first * second} на известный множитель ${first}.`, `Көбөйтүндү ${first * second} санын белгилүү ${first} көбөйткүчүнө бөл.`) },
    { prompt: text(`${first * second} ÷ □ = ${first}. Найди делитель.`, `${first * second} ÷ □ = ${first}. Бөлгүчтү тап.`), answer: second, hint: text("Раздели делимое на частное.", "Бөлүнүүчүнү бөлүндүгө бөл.") },
  ][operation];
  return makeNumberTask(slot, index, promptData.prompt, promptData.answer, promptData.hint, text(`Подставь найденное число в равенство и проверь обе стороны.`, `Табылган санды теңдикке коюп, эки жагын текшер.`));
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
  const groups = slot.grade === 1 ? 2 + seed % 3 : 2 + seed % 5;
  const each = slot.grade === 1 ? 2 + ((seed >> 3) % 3) : 2 + ((seed >> 3) % 5);
  const product = groups * each;
  const askDivision = index % 2 === 1;
  const fruit: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];
  const selectedFruit = fruit[seed % fruit.length];
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
    fruitGroups: [{ fruit: selectedFruit, count: each, groupCount: groups }],
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
    fruitGroups: [
      { fruit: "apple", count: apples },
      { fruit: "pear", count: pears },
    ],
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
  const fruit: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];
  const selectedFruit = fruit[seed % fruit.length];
  const fruitName = {
    apple: text("яблок", "алма"),
    pear: text("груш", "алмурут"),
    banana: text("бананов", "банан"),
    orange: text("апельсинов", "апельсин"),
    strawberry: text("ягод клубники", "кулпунай"),
  }[selectedFruit];
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: index % 3 === 0 ? "choice" : "number",
    prompt: add
      ? text(`В корзине было ${start} ${fruitName.ru}. Положили ещё ${change}. Сколько стало?`, `Себетте ${start} ${fruitName.ky} бар эле. Дагы ${change} салынды. Баары канча болду?`)
      : text(`В корзине было ${start} ${fruitName.ru}. ${change} убрали. Сколько осталось?`, `Себетте ${start} ${fruitName.ky} бар эле. ${change} алынды. Канча калды?`),
    options: shuffledNumberOptions(answer, change, seed),
    answer: String(answer),
    hint: text(
      add
        ? `Нарисуй ${start} фруктов, затем добавь ещё ${change}. Сосчитай всё вместе.`
        : `Нарисуй ${start} фруктов и убери ${change}. Сосчитай, сколько осталось.`,
      add
        ? `${start} мөмө чийип, дагы ${change} кош. Баарын чогуу сана.`
        : `${start} мөмө чийип, ${change} алып сал. Канча калганын сана.`,
    ),
    explanation: text(`${start} ${add ? "+" : "−"} ${change} = ${answer}.`, `${start} ${add ? "+" : "−"} ${change} = ${answer}.`),
    fruitGroups: [
      { fruit: selectedFruit, count: start, label: text("Было", "Бар эле") },
      { fruit: selectedFruit, count: change, label: add ? text("Добавили", "Кошулду") : text("Убрали", "Алынып калды") },
    ],
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

function makeChoiceTask(
  slot: LessonSlot,
  index: number,
  prompt: LocalizedText,
  options: PracticeOption[],
  answer: string,
  hint: LocalizedText,
  explanation: LocalizedText,
  visual?: string,
): PracticeTask {
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "choice",
    prompt,
    options,
    answer,
    hint,
    explanation,
    ...(visual ? { visual } : {}),
  };
}

function makeNumberTask(
  slot: LessonSlot,
  index: number,
  prompt: LocalizedText,
  answer: number,
  hint: LocalizedText,
  explanation: LocalizedText,
  visual?: string,
): PracticeTask {
  return {
    id: `${slot.id}-q${index + 1}`,
    kind: "number",
    prompt,
    answer: String(answer),
    hint,
    explanation,
    ...(visual ? { visual } : {}),
  };
}

function targetedArithmeticTask(slot: LessonSlot, index: number, operation: "add" | "subtract"): PracticeTask {
  const seed = numberSeed(slot, index);
  const max = slot.grade === 1 ? 20 : 100;
  const left = 2 + seed % Math.max(4, Math.floor(max / 2));
  const right = operation === "add"
    ? 1 + ((seed >> 3) % Math.max(2, Math.floor(max / 3)))
    : 1 + ((seed >> 3) % left);
  const result = operation === "add" ? left + right : left - right;
  const sign = operation === "add" ? "+" : "−";
  const hint = operation === "add"
    ? text(`Начни с ${left} и прибавь ещё ${right}.`, `${left} санынан баштап, дагы ${right} санын кош.`)
    : text(`Было ${left}. Убери ${right} и посчитай, сколько осталось.`, `${left} бар эле. ${right} санын алып, канчасы калганын сана.`);
  const explanation = text(`${left} ${sign} ${right} = ${result}.`, `${left} ${sign} ${right} = ${result}.`);
  const prompt = text(`Вычисли: ${left} ${sign} ${right}`, `Эсепте: ${left} ${sign} ${right}`);
  const task = index % 3 === 0
    ? makeNumberTask(slot, index, prompt, result, hint, explanation)
    : makeChoiceTask(
    slot,
    index,
    prompt,
    shuffledNumberOptions(result, right, seed),
    String(result),
    hint,
    explanation,
  );
  return {
    ...task,
    fruitGroups: [{ fruit: operation === "add" ? "apple" : "pear", count: left }],
  };
}

function estimationTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const count = 7 + seed % 13;
  const nearestFive = Math.round(count / 5) * 5;
  const lowerEstimate = nearestFive === 20 ? 10 : nearestFive - 5;
  const upperEstimate = nearestFive === 20 ? 15 : nearestFive + 5;
  const fruit: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];
  const selectedFruit = fruit[seed % fruit.length];
  return {
    ...makeChoiceTask(
      slot,
      index,
      text("Не пересчитывая по одному, оцени количество предметов. Какое число ближе всего?", "Бирден санабай, буюмдардын санын болжолдо. Кайсы сан жакыныраак?"),
      [option(lowerEstimate), option(nearestFive), option(upperEstimate)],
      String(nearestFive),
      text("Сначала оцени на глаз, затем проверь, посчитав по одному.", "Адегенде көз менен болжолдо, андан кийин бирден санап текшер."),
      text(`Всего ${count} предметов — ближе всего оценка ${nearestFive}.`, `Бардыгы ${count} буюм — ага эң жакын болжол ${nearestFive}.`),
    ),
    fruitGroups: [{ fruit: selectedFruit, count }],
  };
}

function countingCompositionTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const maximum = slot.grade === 1 && slot.topic.sourceOrder === 4 ? 10 : 20;
  if (index % 3 === 0) {
    const count = 1 + seed % 10;
    const fruit: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];
    const selectedFruit = fruit[seed % fruit.length];
    return {
      ...makeChoiceTask(
        slot,
        index,
        text("Сосчитай предметы. Сколько их?", "Буюмдарды сана. Алар канча?"),
        shuffledNumberOptions(count, 2, seed),
        String(count),
        text("Считай каждый предмет один раз, не пропуская и не считая повторно.", "Ар бир буюмду өткөрбөй, кайра санабай бир жолу сана."),
        text(`Всего ${count} предметов.`, `Бардыгы ${count} буюм.`),
      ),
      fruitGroups: [{ fruit: selectedFruit, count }],
    };
  }
  const total = 4 + seed % (maximum - 3);
  const firstPart = 1 + ((seed >> 2) % (total - 1));
  const secondPart = total - firstPart;
  const prompt = text(`Число ${total} состоит из ${firstPart} и какого числа?`, `${total} саны ${firstPart} жана кайсы сандан түзүлөт?`);
  const hint = text(`Раздели ${total} предметов на две части. Одна часть — ${firstPart}.`, `${total} буюмду эки бөлүккө бөл. Бир бөлүгү — ${firstPart}.`);
  const explanation = text(`${firstPart} + ${secondPart} = ${total}.`, `${firstPart} + ${secondPart} = ${total}.`);
  return index % 3 === 0
    ? makeNumberTask(slot, index, prompt, secondPart, hint, explanation)
    : makeChoiceTask(slot, index, prompt, shuffledNumberOptions(secondPart, 2, seed), String(secondPart), hint, explanation);
}

function ordinalOrParityTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const value = 2 + seed % 10;
  const mode = index % 3;
  if (mode === 0) {
    const ordinal = value % 5;
    const ordinals = [
      text("первым", "биринчи"),
      text("вторым", "экинчи"),
      text("третьим", "үчүнчү"),
      text("четвёртым", "төртүнчү"),
      text("пятым", "бешинчи"),
    ];
    const answer = ordinals[ordinal];
    return makeChoiceTask(
      slot,
      index,
      text(`Какое место занимает число ${ordinal + 1} в ряду от 1 до 5?`, `1ден 5ке чейинки катарда ${ordinal + 1} саны канчанчы орунда?`),
      ordinals.map((label, optionIndex) => option(String(optionIndex), label.ru, label.ky)),
      String(ordinal),
      text("Прочитай числа по порядку от 1 до 5.", "1ден 5ке чейин сандарды ирети менен оку."),
      text(`${ordinal + 1} стоит ${answer.ru}.`, `${ordinal + 1} саны ${answer.ky} орунда турат.`),
      "1　2　3　4　5",
    );
  }
  const even = value % 2 === 0;
  return makeChoiceTask(
    slot,
    index,
    text(`Число ${value} чётное или нечётное?`, `${value} саны жуппу же такпы?`),
    [option("even", "Чётное", "Жуп"), option("odd", "Нечётное", "Так")],
    even ? "even" : "odd",
    text(`Попробуй разложить ${value} предметов по парам.`, `${value} буюмду жуптап бөлүп көр.`),
    text(even ? `${value} делится на 2 без остатка.` : `Один предмет останется без пары.` , even ? `${value} саны 2ге калдыксыз бөлүнөт.` : `Бир буюм жупсуз калат.`),
  );
}

function groupingComparisonTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const firstCount = 2 + seed % 6;
  const secondCount = 2 + ((seed >> 3) % 6);
  const mode = index % 2 === 0 ? "compare" : "order";
  const answer = firstCount === secondCount
    ? "equal"
    : mode === "compare"
      ? firstCount > secondCount ? "first" : "second"
      : firstCount < secondCount ? "first" : "second";
  const prompt = mode === "compare"
    ? text(`В первой группе ${firstCount} предмета, во второй — ${secondCount}. Где больше?`, `Биринчи топто ${firstCount}, экинчисинде ${secondCount} буюм бар. Кайсы топто көп?`)
    : text(`В какой последовательности поставить группы от меньшей к большей: ${firstCount} и ${secondCount}?`, `${firstCount} жана ${secondCount} топторун кичинеден чоңго кандай иреттейбиз?`);
  const choices = [
    option("first", `Первая (${firstCount})`, `Биринчи (${firstCount})`),
    option("second", `Вторая (${secondCount})`, `Экинчи (${secondCount})`),
    option("equal", "Поровну", "Тең"),
  ];
  return {
    ...makeChoiceTask(
      slot,
      index,
      prompt,
      choices,
      answer,
      text("Сопоставь предметы парами и посмотри, в какой группе останутся лишние.", "Буюмдарды жуптап салыштырып, кайсы топто ашыкча калганын кара."),
      text(firstCount === secondCount ? "В обеих группах поровну." : `Сравни количества: ${firstCount} и ${secondCount}.`, firstCount === secondCount ? "Эки топто тең санда." : `Сандарды салыштыр: ${firstCount} жана ${secondCount}.`),
    ),
    fruitGroups: [
      { fruit: "apple", count: firstCount, label: text("Первая", "Биринчи") },
      { fruit: "pear", count: secondCount, label: text("Вторая", "Экинчи") },
    ],
  };
}

function placeValueOrTensTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const tens = 1 + seed % 9;
  const ones = (seed >> 3) % 10;
  const value = tens * 10 + ones;
  const addends = [8, 7, 6, 9, 5, 4];
  const addend = addends[index % addends.length];
  if (index % 2 === 0) {
    const prompt = text(`Разложи число ${value} на десятки и единицы: сколько десятков?`, `${value} санын ондуктарга жана бирдиктерге ажырат: канча ондук?`);
    return makeChoiceTask(
      slot,
      index,
      prompt,
      shuffledNumberOptions(tens, 1, seed),
      String(tens),
      text(`В числе ${value} десятки показывает цифра слева.`, `${value} санындагы ондуктарды сол жактагы цифра көрсөтөт.`),
      text(`${value} = ${tens} десят. и ${ones} ед.`, `${value} = ${tens} ондук жана ${ones} бирдик.`),
    );
  }
  const left = 2 + seed % 10;
  const result = left + addend;
  return makeChoiceTask(
    slot,
    index,
    text(`Найди сумму: ${left} + ${addend}`, `Сумманы тап: ${left} + ${addend}`),
    shuffledNumberOptions(result, addend, seed),
    String(result),
    text(`Разложи ${addend} на удобные части и сначала дополни ${left} до круглого десятка.`, `${addend} санын ыңгайлуу бөлүктөргө ажыратып, адегенде ${left} санын тегерек ондукка толукта.`),
    text(`${left} + ${addend} = ${result}.`, `${left} + ${addend} = ${result}.`),
  );
}

function romanOrTensTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const numeralValues = [
    { roman: "I", value: 1 },
    { roman: "II", value: 2 },
    { roman: "III", value: 3 },
    { roman: "IV", value: 4 },
    { roman: "V", value: 5 },
    { roman: "VI", value: 6 },
    { roman: "VII", value: 7 },
    { roman: "VIII", value: 8 },
    { roman: "IX", value: 9 },
    { roman: "X", value: 10 },
  ];
  if (index % 2 === 0) {
    const item = numeralValues[seed % numeralValues.length];
    const roman = romanNumeral(item.value);
    return makeChoiceTask(
      slot,
      index,
      text(`Что означает римская цифра ${roman}?`, `${roman} рим цифрасы эмнени билдирет?`),
      shuffledNumberOptions(item.value, 2, seed),
      String(item.value),
      text("I — один, V — пять, X — десять. Учитывай, какой знак стоит первым.", "I — бир, V — беш, X — он. Белгилердин кайсынысы биринчи турганын байка."),
      text(`${roman} = ${item.value}.`, `${roman} = ${item.value}.`),
      "I　II　III　IV　V　VI　VII　VIII　IX　X",
    );
  }
  const tens = 10 * (1 + seed % 9);
  const rounded = Math.round((tens + (seed % 10)) / 10) * 10;
  return makeChoiceTask(
    slot,
    index,
    text(`Какой круглый десяток ближе всего к ${rounded + 3}?`, `${rounded + 3} санына кайсы тегерек ондук жакыныраак?`),
    [option(rounded - 10), option(rounded), option(rounded + 10)],
    String(rounded),
    text("Сравни число с ближайшими десятками и посмотри, к какому расстояние меньше.", "Санды жакынкы ондуктар менен салыштырып, кайсысына жакын экенин аныкта."),
    text(`Ближайший круглый десяток — ${rounded}.`, `Эң жакын тегерек ондук — ${rounded}.`),
  );
}

function roundingTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const number = 11 + seed % 88;
  const lower = Math.floor(number / 10) * 10;
  const rounded = number % 10 < 5 ? lower : lower + 10;
  const distractors = [...new Set([rounded - 10, rounded + 10, rounded - 20, rounded + 20])]
    .filter((value) => value >= 0 && value <= 100 && value !== rounded);
  return makeChoiceTask(
    slot,
    index,
    text(`Округли ${number} до ближайшего десятка.`, `${number} санын жакынкы ондукка чейин тегеректе.`),
    [option(distractors[0]), option(rounded), option(distractors[1])],
    String(rounded),
    text(`Посмотри на цифру единиц числа ${number}. Если она меньше 5, округляем вниз; если 5 или больше — вверх.`, `${number} санынын бирдик цифрасын кара. Ал 5тен кичине болсо төмөн, 5 же андан чоң болсо жогору тегеректейбиз.`),
    text(`${number} округляется до ${rounded}.`, `${number} саны ${rounded} болуп тегеректелет.`),
  );
}

function matrixTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const rows = 2 + seed % 3;
  const columns = 2 + ((seed >> 3) % 3);
  const row = 1 + index % rows;
  const column = 1 + (index + 1) % columns;
  const prompt = index % 2 === 0
    ? text(`В прямоугольной таблице ${rows} строки и ${columns} столбца. Сколько клеток в ${row}-й строке?`, `Тик бурчтуу таблицада ${rows} сап жана ${columns} мамыча бар. ${row}-сапта канча уяча бар?`)
    : text(`В прямоугольной таблице ${rows} строки и ${columns} столбца. Сколько клеток в ${column}-м столбце?`, `Тик бурчтуу таблицада ${rows} сап жана ${columns} мамыча бар. ${column}-мамычада канча уяча бар?`);
  return {
    ...makeChoiceTask(
      slot,
      index,
      prompt,
      shuffledNumberOptions(index % 2 === 0 ? columns : rows, 1, seed),
      String(index % 2 === 0 ? columns : rows),
      text("В каждой строке одинаковое число клеток — по числу столбцов. В каждом столбце — по числу строк.", "Ар бир сапта мамычалардын санына барабар уяча бар. Ар бир мамычада саптардын санына барабар уяча бар."),
      text(`В этой таблице ${rows} × ${columns} = ${rows * columns} клеток.`, `Бул таблицада ${rows} × ${columns} = ${rows * columns} уяча бар.`),
      Array.from({ length: rows }, () => "□ ".repeat(columns).trim()).join("\n"),
    ),
    fruitGroups: [
      { fruit: "apple", count: rows },
      { fruit: "pear", count: columns },
    ],
  };
}

function measurementByTopicTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const topicOrder = slot.topic.sourceOrder;
  if (slot.grade === 1 && topicOrder === 19) {
    const start = 1 + seed % 5;
    const length = 2 + ((seed >> 3) % 10);
    return makeNumberTask(
      slot,
      index,
      text(`Отрезок начинается на отметке ${start} см и заканчивается на ${start + length} см. Какова его длина?`, `Кесинди ${start} см белгисинен башталып, ${start + length} см белгисинде бүтөт. Узундугу канча?`),
      length,
      text(`Длина — это разность конечной и начальной отметок.`, `Узундук — акыркы жана баштапкы белгилердин айырмасы.`),
      text(`${start + length} − ${start} = ${length} см.`, `${start + length} − ${start} = ${length} см.`),
      `${start} см ├━━━━━━┤ ${start + length} см`,
    );
  }
  if (slot.grade === 1 && topicOrder === 32) {
    const temperature = seed % 31 - 5;
    return makeChoiceTask(
      slot,
      index,
      text(`Термометр показывает ${temperature} °C. Какая температура будет на 2 °C выше?`, `Термометр ${temperature} °C көрсөтүп турат. Температура 2 °Cге жогоруласа канча болот?`),
      shuffledNumberOptions(temperature + 2, 2, seed),
      String(temperature + 2),
      text("При повышении температуры прибавь градусы.", "Температура жогорулаганда градустарды кош."),
      text(`${temperature} + 2 = ${temperature + 2} °C.`, `${temperature} + 2 = ${temperature + 2} °C.`),
      `❄　${temperature}°C　→　${temperature + 2}°C`,
    );
  }

  const modes = ["length", "mass", "time", "money", "speed"] as const;
  const availableModes = slot.grade === 1
    ? topicOrder === 24 ? modes.slice(0, 4) : ["length"] as const
    : topicOrder === 17 ? modes : ["length", "mass", "time"] as const;
  const mode = availableModes[(slot.part - 1 + index) % availableModes.length];
  if (mode === "length") {
    const length = 3 + seed % 15;
    return makeChoiceTask(slot, index, text(`Какой единицей удобно измерить длину ластика: ${length} сантиметров или ${length} часов?`, `Өчүргүчтүн узундугун ${length} сантиметр же ${length} саат менен өлчөйбүзбү?`), [option("cm", "Сантиметрами", "Сантиметр менен"), option("hours", "Часами", "Саат менен"), option("kg", "Килограммами", "Килограмм менен")], "cm", text("Длину измеряют единицами длины.", "Узундукту узундук бирдиктери менен өлчөйт."), text("Небольшую длину измеряют в сантиметрах.", "Кыска узундукту сантиметр менен өлчөйт."), "📏　0 ├━━━━━━┤");
  }
  if (mode === "mass") {
    const weight = 2 + seed % 8;
    return makeNumberTask(slot, index, text(`Пакет яблок весит ${weight} кг, а пакет груш — 2 кг. Какова общая масса?`, `Алма салынган баштык ${weight} кг, алмурут салынганы 2 кг. Жалпы массасы канча?`), weight + 2, text("Сложи массы и сохрани единицу измерения.", "Массаларды кошуп, өлчөө бирдигин жаз."), text(`${weight} кг + 2 кг = ${weight + 2} кг.`, `${weight} кг + 2 кг = ${weight + 2} кг.`));
  }
  if (mode === "time") {
    const minutes = 10 * (1 + seed % 5);
    return makeNumberTask(slot, index, text(`Занятие длилось ${minutes} минут, затем ещё 10 минут. Сколько минут всего?`, `Сабак ${minutes} мүнөт, андан кийин дагы 10 мүнөт уланды. Баары канча мүнөт?`), minutes + 10, text("Сложи промежутки времени, выраженные в одинаковых единицах.", "Бирдей бирдик менен берилген убакыттарды кош."), text(`${minutes} + 10 = ${minutes + 10} минут.`, `${minutes} + 10 = ${minutes + 10} мүнөт.`), "⏱　минуты");
  }
  if (mode === "speed") {
    const distance = 2 + seed % 8;
    const hours = 2 + (seed >> 3) % 4;
    return makeNumberTask(slot, index, text(`За ${hours} часа велосипедист проехал ${distance * hours} км. Сколько километров он проезжал за час?`, `${hours} саатта велосипедчи ${distance * hours} км жүрдү. Бир саатта канча километр жүргөн?`), distance, text(`Раздели весь путь на число часов: ${distance * hours} ÷ ${hours}.`, `Жолдун жалпы узундугун сааттардын санына бөл: ${distance * hours} ÷ ${hours}.`), text(`${distance * hours} ÷ ${hours} = ${distance} км/ч.`, `${distance * hours} ÷ ${hours} = ${distance} км/саат.`));
  }
  const price = 2 + seed % 8;
  const count = 2 + (seed >> 3) % 5;
  return makeNumberTask(slot, index, text(`Один карандаш стоит ${price} сомов. Сколько стоят ${count} карандаша?`, `Бир калем ${price} сом турат. ${count} калем канча турат?`), price * count, text(`Повтори цену ${count} раз или умножь ${price} на ${count}.`, `Бааны ${count} жолу кош же ${price} санын ${count}кө көбөйт.`), text(`${price} × ${count} = ${price * count} сомов.`, `${price} × ${count} = ${price * count} сом.`));
}

function equationComponentTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const first = 3 + seed % 12;
  const second = 1 + ((seed >> 3) % first);
  const result = first + second;
  const unknown = index % 3;
  const prompts = [
    text(`□ + ${second} = ${result}. Найди неизвестное слагаемое.`, `□ + ${second} = ${result}. Белгисиз кошулуучуну тап.`),
    text(`${result} − □ = ${second}. Найди неизвестное вычитаемое.`, `${result} − □ = ${second}. Белгисиз кемитүүчүнү тап.`),
    text(`□ − ${second} = ${first}. Найди неизвестное уменьшаемое.`, `□ − ${second} = ${first}. Белгисиз кемүүчүнү тап.`),
  ];
  const answers = [first, first, result];
  const answer = answers[unknown];
  return makeChoiceTask(slot, index, prompts[unknown], shuffledNumberOptions(answer, second, seed), String(answer), text("Используй обратное действие и проверь подстановкой.", "Тескери амалды колдонуп, ордуна коюп текшер."), text(`Неизвестное число равно ${answer}.`, `Белгисиз сан ${answer}гө барабар.`));
}

function comparisonWordProblemTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const smaller = 2 + seed % (slot.grade === 1 ? 8 : 20);
  const difference = 1 + ((seed >> 3) % 7);
  const larger = smaller + difference;
  const askLarger = index % 2 === 0;
  const prompt = askLarger
    ? text(`У Айжан ${smaller} яблока, а у Бекзата на ${difference} больше. Сколько яблок у Бекзата?`, `Айжанда ${smaller} алма бар, Бекзатта андан ${difference}кө көп. Бекзатта канча алма бар?`)
    : text(`У Айжан ${larger} яблок, а у Бекзата на ${difference} меньше. Сколько яблок у Бекзата?`, `Айжанда ${larger} алма бар, Бекзатта андан ${difference}кө аз. Бекзатта канча алма бар?`);
  const answer = askLarger ? larger : smaller;
  return {
    ...makeNumberTask(slot, index, prompt, answer, text(`Найди известное количество и прибавь или отними разницу ${difference}.`, `Белгилүү санды таап, ${difference} айырмасын кош же кемит.`), text(`Разница ${difference}, поэтому ответ — ${answer}.`, `Айырмасы ${difference}, демек жооп — ${answer}.`), `${"🍎 ".repeat(Math.min(10, smaller))}\n${"🍎 ".repeat(Math.min(10, difference))}`),
    fruitGroups: [
      { fruit: "apple", count: smaller, label: text("Меньше", "Азыраак") },
      { fruit: "pear", count: larger, label: text("Больше", "Көбүрөөк") },
    ],
  };
}

function shapeDimensionTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const solids = [
    { name: text("куб", "куб"), property: text("6 квадратных граней", "6 чарчы жагы") },
    { name: text("шар", "шар"), property: text("круглая поверхность без вершин", "чокулары жок тоголок бет") },
    { name: text("цилиндр", "цилиндр"), property: text("два круглых основания", "эки тегерек негизи") },
  ];
  const flat = [
    { name: text("круг", "тегерек"), property: text("нет углов", "бурчу жок"), symbol: "●" },
    { name: text("треугольник", "үч бурчтук"), property: text("3 стороны", "3 жагы"), symbol: "▲" },
    { name: text("квадрат", "чарчы"), property: text("4 равные стороны", "4 тең жагы"), symbol: "■" },
  ];
  const useSolid = slot.grade === 1 ? index % 2 === 1 : index % 3 !== 0;
  if (useSolid) {
    const solid = solids[seed % solids.length];
    const labels: Record<string, LocalizedText> = {
      cube: text("Куб", "Куб"),
      sphere: text("Шар", "Шар"),
      cylinder: text("Цилиндр", "Цилиндр"),
      circle: text("Круг", "Тегерек"),
      triangle: text("Треугольник", "Үч бурчтук"),
      square: text("Квадрат", "Чарчы"),
    };
    const correctValue = solid.name.ru;
    const options = [correctValue, ...solids.filter((item) => item !== solid).map((item) => item.name.ru)]
      .map((value) => option(value, labels[value]?.ru ?? value, labels[value]?.ky ?? value));
    return makeChoiceTask(slot, index, text(`Какое объёмное тело имеет ${solid.property.ru}?`, `${solid.property.ky} бар көлөмдүү дене кайсы?`), options, correctValue, text("Объёмное тело занимает место в пространстве; сравни его поверхность и вершины.", "Көлөмдүү дене мейкиндикте орун ээлейт; бетин жана чокуларын салыштыр."), text(`${solid.name.ru[0].toUpperCase()}${solid.name.ru.slice(1)} — объёмное тело с признаками: ${solid.property.ru}.`, `${solid.name.ky} — ${solid.property.ky} бар көлөмдүү дене.`), "◻　●　▱");
  }
  const target = flat[seed % flat.length];
  return makeChoiceTask(slot, index, text(`Какая плоская фигура имеет признак: ${target.property.ru}?`, `Кайсы жалпак фигуранын белгиси ${target.property.ky}?`), flat.map((item) => option(item.name.ru, item.name.ru, item.name.ky)), target.name.ru, text("Плоскую фигуру можно нарисовать на листе; посчитай её стороны и углы.", "Жалпак фигураны кагазга тартса болот; жактарын жана бурчтарын сана."), text(`${target.name.ru}: ${target.property.ru}.`, `${target.name.ky}: ${target.property.ky}.`), flat.map((item) => item.symbol).join("　"));
}

function polygonPerimeterTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const sides = 3 + (index % 4);
  const lengths = Array.from({ length: sides }, (_, side) => 2 + ((seed + side * 7) % 7));
  const perimeter = lengths.reduce((sum, length) => sum + length, 0);
  return makeNumberTask(slot, index, text(`У ${sides}-угольника длины сторон ${lengths.join(", ")} см. Найди периметр.`, ` ${sides} бурчтуктун жактары ${lengths.join(", ")} см. Периметрин тап.`), perimeter, text("Периметр — сумма длин всех сторон.", "Периметр — бардык жактардын узундуктарынын суммасы."), text(`${lengths.join(" + ")} = ${perimeter} см.`, `${lengths.join(" + ")} = ${perimeter} см.`), "⬠");
}

function angleTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const rightAngle = index % 2 === 0;
  const degrees = rightAngle ? 90 : [45, 60, 120, 180][seed % 4];
  const kind = degrees < 90 ? text("острый", "тар бурч") : degrees === 90 ? text("прямой", "тик бурч") : text("тупой", "кең бурч");
  return makeChoiceTask(slot, index, text(`Угол ${degrees}°. Какой это угол?`, `Бурч ${degrees}°. Бул кандай бурч?`), [option("acute", "Острый", "Тар бурч"), option("right", "Прямой", "Тик бурч"), option("obtuse", "Тупой", "Кең бурч")], degrees < 90 ? "acute" : degrees === 90 ? "right" : "obtuse", text("Прямой угол равен 90°. Сравни угол с прямым.", "Тик бурч 90°ка барабар. Бурчту тик бурч менен салыштыр."), text(`${degrees}° — ${kind.ru} угол.`, `${degrees}° — ${kind.ky}.`), "∠");
}

function romanNumeral(value: number): string {
  const numerals: Array<[number, string]> = [[90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let remainder = value;
  let result = "";
  for (const [amount, symbol] of numerals) {
    while (remainder >= amount) {
      result += symbol;
      remainder -= amount;
    }
  }
  return result;
}

function dataClassificationTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const count = 3 + seed % 6;
  const even = index % 2 === 0;
  const answer = even ? count % 2 === 0 ? "even" : "odd" : "red";
  return {
    ...makeChoiceTask(slot, index, even
      ? text(`В диаграмме Венна группы обозначены «чётное» и «нечётное». К какой группе относится ${count}?`, `Венн диаграммасында топтор «жуп» жана «так» деп белгиленген. ${count} кайсы топко кирет?`)
      : text("В диаграмме Кэрролла один столбец — красные фигуры, другой — некрасные. Куда поместить красный треугольник?", "Кэрролл диаграммасынын бир мамычасы кызыл фигуралар, экинчиси кызыл эмес фигуралар. Кызыл үч бурчтук кайда жайгашат?"),
    even
      ? [option("even", "В группу чётных", "Жуп сандар тобуна"), option("odd", "В группу нечётных", "Так сандар тобуна")]
      : [option("red", "В группу красных", "Кызылдар тобуна"), option("not-red", "В группу некрасных", "Кызыл эмес фигуралар тобуна")],
    answer,
    text("Сравни число или фигуру с признаками, указанными в названиях групп.", "Санды же фигураны топтордун аталыштарындагы белгилер менен салыштыр."),
    text(even ? `${count} — ${count % 2 === 0 ? "чётное" : "нечётное"} число.` : "Красный треугольник относится к группе красных фигур.", even ? `${count} — ${count % 2 === 0 ? "жуп" : "так"} сан.` : "Кызыл үч бурчтук кызыл фигуралар тобуна кирет."),
    "Венн:　○　∩　○",
    ),
    fruitGroups: [
      { fruit: "apple", count },
      { fruit: "pear", count: 2 + ((seed >> 3) % 6) },
    ],
  };
}

function rotationTask(slot: LessonSlot, index: number): PracticeTask {
  const turns = 1 + index % 3;
  const direction = index % 2 === 0 ? "по часовой стрелке" : "против часовой стрелки";
  const answer = ((turns * 90) % 360);
  return makeChoiceTask(slot, index, text(`Фигуру повернули на ${turns} четверть-оборота ${direction}. На сколько градусов она повернулась?`, `Фигура ${turns} чейрек айланууга бурулду. Ал канча градуска бурулду?`), [option(90), option(180), option(270)], String(answer), text("Один четверть-оборот — это 90°. Умножь число поворотов на 90.", "Бир чейрек айлануу — 90°. Айлануулардын санын 90го көбөйт."), text(`${turns} × 90° = ${answer}°.`, `${turns} × 90° = ${answer}°.`), "↑　→　↓　←");
}

function brokenLineTask(slot: LessonSlot, index: number): PracticeTask {
  const segments = 2 + index % 5;
  const visual = Array.from({ length: segments }, (_, segment) => segment % 2 === 0 ? "／" : "＼").join("　");
  return makeNumberTask(
    slot,
    index,
    text(`Создай ломаную из ${segments} отрезков. Сколько звеньев будет у ломаной?`, `${segments} кесиндиден сынык сызык түз. Анын канча звеносу болот?`),
    segments,
    text("Каждый отрезок ломаной образует одно звено.", "Сынык сызыктын ар бир кесиндиси бир звенону түзөт."),
    text(`${segments} отрезков образуют ${segments} звеньев.`, `${segments} кесинди ${segments} звенону түзөт.`),
    visual,
  );
}

function multiStepWordProblemTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const first = 4 + seed % 12;
  const added = 2 + ((seed >> 3) % 8);
  const removed = 1 + ((seed >> 5) % Math.min(first + added, 6));
  const answer = first + added - removed;
  const fruit: LessonFruit[] = ["apple", "pear", "banana", "orange", "strawberry"];
  const selectedFruit = fruit[seed % fruit.length];
  const names: Record<LessonFruit, LocalizedText> = {
    apple: text("яблок", "алма"),
    pear: text("груш", "алмурут"),
    banana: text("бананов", "банан"),
    orange: text("апельсинов", "апельсин"),
    strawberry: text("ягод клубники", "кулпунай"),
  };
  const name = names[selectedFruit];
  return {
    ...makeNumberTask(slot, index, text(`В корзине было ${first} ${name.ru}. Положили ещё ${added}, затем ${removed} отдали. Сколько осталось?`, `Себетте ${first} ${name.ky} бар эле. Дагы ${added} кошуп, анан ${removed} белекке беришти. Канча калды?`), answer, text(`Сначала прибавь ${added}, потом вычти ${removed}.`, `Адегенде ${added} кош, андан кийин ${removed} кемит.`), text(`${first} + ${added} − ${removed} = ${answer}.`, `${first} + ${added} − ${removed} = ${answer}.`)),
    fruitGroups: [
      { fruit: selectedFruit, count: first, label: text("Было", "Бар эле") },
      { fruit: selectedFruit, count: added, label: text("Добавили", "Кошулду") },
      { fruit: selectedFruit, count: removed, label: text("Убрали", "Алынып калды") },
    ],
  };
}

function fractionByTopicTask(slot: LessonSlot, index: number): PracticeTask {
  const topic = slot.topic.sourceOrder;
  const quarters = slot.grade === 2 && (index % 2 === 1 || topic === 11 && index % 3 === 2);
  const parts = quarters ? 4 : 2;
  const options = [2, 3, 4].map((value) => option(value));

  if (slot.grade === 1 && topic === 30 && index % 3 === 2) {
    const answer = 6;
    return makeNumberTask(
      slot,
      index,
      text("Целое составили из 2 равных частей. Сколько таких частей образуют 3 целых?", "Бүтүн 2 тең бөлүктөн турат. 3 бүтүндү түзүү үчүн ушундай канча бөлүк керек?"),
      answer,
      text("В каждом целом две одинаковые части. Возьми по две части три раза.", "Ар бир бүтүндө эки бирдей бөлүк бар. Үч жолу экиден бөлүк ал."),
      text("2 + 2 + 2 = 6 частей.", "2 + 2 + 2 = 6 бөлүк."),
      "◩◪　◩◪　◩◪",
    );
  }

  if (slot.grade === 1 && topic === 30) {
    const equalParts = index % 3 === 0;
    return makeChoiceTask(
      slot,
      index,
      equalParts
        ? text("Целое разделили на две одинаковые по размеру части. Они равные?", "Бүтүн өлчөмү бирдей эки бөлүккө бөлүндү. Алар теңби?")
        : text("Целое разделили на две разные по размеру части. Они равные?", "Бүтүн өлчөмү ар башка эки бөлүккө бөлүндү. Алар теңби?"),
      [option("yes", "Да", "Ооба"), option("no", "Нет", "Жок")],
      equalParts ? "yes" : "no",
      text("Равные части имеют одинаковый размер.", "Тең бөлүктөрдүн өлчөмү бирдей болот."),
      text(equalParts ? "Обе части одинаковы, значит, они равные." : "Части разного размера не являются равными.", equalParts ? "Эки бөлүктүн өлчөмү бирдей, демек алар тең." : "Өлчөмү ар башка бөлүктөр тең эмес."),
      equalParts ? "◧ → ◩　◪" : "◧ → ◩　◔",
    );
  }

  const prompt = slot.grade === 1 && topic === 29
    ? text("На сколько равных частей нужно разделить целое, чтобы получить половины?", "Жарымдарды алуу үчүн бүтүндү канча тең бөлүккө бөлүү керек?")
    : text(`Целое разделили на ${parts} равные части. Как называется одна такая часть?`, `Бүтүн ${parts} тең бөлүккө бөлүндү. Ушундай бир бөлүк кандай аталат?`);
  const answer = slot.grade === 1 && topic === 29 ? "2" : quarters ? "quarter" : "half";
  if (slot.grade === 1 && topic === 29) {
    return makeChoiceTask(
      slot,
      index,
      prompt,
      options,
      answer,
      text("Чтобы получить две половины, разрежь целое ровно пополам.", "Эки жарым алуу үчүн бүтүндү так ортосунан бөл."),
      text("Половины — две равные части целого.", "Жарымдар — бүтүндүн эки тең бөлүгү."),
      "◯ → ◐　◑",
    );
  }
  return makeChoiceTask(
    slot,
    index,
    prompt,
    [option("half", "Половина", "Жарым"), option("quarter", "Четверть", "Төрттөн бир"), option("whole", "Целое", "Бүтүн")],
    answer,
    text(quarters ? "Четверть — одна из четырёх одинаковых частей." : "Половина — одна из двух одинаковых частей.", quarters ? "Төрттөн бир — төрт бирдей бөлүктүн бири." : "Жарым — эки бирдей бөлүктүн бири."),
    text(quarters ? "Одна из четырёх равных частей называется четвертью." : "Одна из двух равных частей называется половиной.", quarters ? "Төрт тең бөлүктүн бири төрттөн бир деп аталат." : "Эки тең бөлүктүн бири жарым деп аталат."),
    quarters ? "◯ → ◔　◔　◔　◔" : "◯ → ◐　◑",
  );
}

function dataByTopicTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const apples = 2 + seed % 7;
  const pears = 2 + ((seed >> 3) % 7);
  const isCollection = slot.grade === 2 && index % 2 === 1 || slot.grade === 1 && slot.topic.sourceOrder === 23;
  const answer = isCollection ? apples + pears : apples > pears ? apples : pears;
  const task = makeChoiceTask(
    slot,
    index,
    isCollection
      ? text(`Собери данные о фруктах: в таблице ${apples} яблок и ${pears} груши. Сколько фруктов всего?`, `Мөмөлөр тууралуу маалыматты топто: таблицада ${apples} алма жана ${pears} алмурут бар. Бардыгы канча мөмө?`)
      : text(`По пиктограмме: 🍎 = ${apples}, 🍐 = ${pears}. Каких фруктов больше?`, `Пиктограмма боюнча: 🍎 = ${apples}, 🍐 = ${pears}. Кайсы мөмө көп?`),
    isCollection
      ? shuffledNumberOptions(answer, 2, seed)
      : [option("apple", "Яблок", "Алма"), option("pear", "Груш", "Алмурут"), option("equal", "Поровну", "Бирдей")],
    isCollection ? String(answer) : apples === pears ? "equal" : apples > pears ? "apple" : "pear",
    text("Сравни значения в строках таблицы или пиктограммы; для общего количества сложи категории.", "Таблицанын же пиктограмманын маанилерин салыштыр; жалпы сан үчүн категорияларды кош."),
    text(isCollection ? `${apples} + ${pears} = ${answer} фруктов.` : apples === pears ? "Количество одинаковое." : `${apples > pears ? apples : pears} больше, чем ${apples > pears ? pears : apples}.`, isCollection ? `${apples} + ${pears} = ${answer} мөмө.` : apples === pears ? "Сандары бирдей." : `${apples > pears ? apples : pears} саны ${apples > pears ? pears : apples} санынан көп.`),
    `Фрукты　🍎 ${apples}　🍐 ${pears}`,
  );
  return {
    ...task,
    fruitGroups: [
      { fruit: "apple", count: apples },
      { fruit: "pear", count: pears },
    ],
  };
}

function multiplicativeComparisonTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  if (index % 2 === 1) {
    const start = 2 + seed % 2;
    const factor = 2 + (seed >> 3) % 2;
    const sequence = [start, start * factor, start * factor * factor];
    return {
      ...makeNumberTask(
        slot,
        index,
        text(`Продолжи закономерность: ${sequence[0]}, ${sequence[1]}, ${sequence[2]}, …`, `Мыйзам ченемдүүлүктү улант: ${sequence[0]}, ${sequence[1]}, ${sequence[2]}, …`),
        sequence[2] * factor,
        text(`Каждое следующее число в ${factor} раза больше предыдущего.`, `Ар бир кийинки сан мурункусунан ${factor} эсе чоң.`),
        text(`${sequence[2]} × ${factor} = ${sequence[2] * factor}.`, `${sequence[2]} × ${factor} = ${sequence[2] * factor}.`),
      ),
      fruitGroups: [{ fruit: "apple", count: start, groupCount: factor }],
    };
  }
  const smaller = 2 + seed % 8;
  const factor = 2 + (seed >> 3) % 5;
  const larger = smaller * factor;
  const mode = index % 4;
  const askLarger = mode === 0;
  const askSmaller = mode === 2;
  return {
    ...makeNumberTask(
      slot,
      index,
      askLarger
        ? text(`${larger} яблок — это во сколько раз больше, чем ${smaller} яблок?`, `${larger} алма ${smaller} алмадан канча эсе көп?`)
        : askSmaller
          ? text(`${smaller} яблок — это во сколько раз меньше, чем ${larger} яблок?`, `${smaller} алма ${larger} алмадан канча эсе аз?`)
          : text(`${larger} яблок разделили поровну между ${factor} детьми. Сколько яблок получил каждый?`, `${larger} алманы ${factor} балага тең бөлүштү. Ар бири канчадан алма алды?`),
      askLarger || askSmaller ? factor : smaller,
      text(askLarger || askSmaller ? "Чтобы узнать, во сколько раз отличаются количества, раздели большее на меньшее." : "Раздели общее количество поровну на число детей.", askLarger || askSmaller ? "Сандар канча эсе айырмаланарын билүү үчүн чоң санды кичине санга бөл." : "Жалпы санды балдардын санына тең бөл."),
      text(askLarger || askSmaller ? `${larger} ÷ ${smaller} = ${factor} раза.` : `${larger} ÷ ${factor} = ${smaller}.`, askLarger || askSmaller ? `${larger} ÷ ${smaller} = ${factor} эсе.` : `${larger} ÷ ${factor} = ${smaller}.`),
    ),
    fruitGroups: [{ fruit: "apple", count: smaller, groupCount: factor }],
  };
}

function expressionComparisonTask(slot: LessonSlot, index: number): PracticeTask {
  const seed = numberSeed(slot, index);
  const left = 3 + seed % 12;
  const right = 2 + (seed >> 3) % 10;
  const mode = index % 3;
  const a = mode === 0 ? `${left} + ${right}` : mode === 1 ? `${left + right} − ${right}` : `${left} + 2`;
  const b = mode === 0 ? `${left + right} − ${left}` : mode === 1 ? `${left} + ${right}` : `${left + 1} + 1`;
  const leftValue = mode === 0 ? left + right : mode === 1 ? left : left + 2;
  const rightValue = mode === 0 ? right : mode === 1 ? left + right : left + 2;
  const answer = leftValue > rightValue ? ">" : leftValue < rightValue ? "<" : "=";
  return makeChoiceTask(
    slot,
    index,
    text(`Сравни значения выражений: ${a} □ ${b}.`, `Туюнтмалардын маанилерин салыштыр: ${a} □ ${b}.`),
    [option(">"), option("<"), option("=")],
    answer,
    text("Сначала вычисли значение слева и справа, затем сравни результаты.", "Адегенде сол жана оң жактагы туюнтмаларды эсептеп, анан жыйынтыктарды салыштыр."),
    text(`${leftValue} ${answer} ${rightValue}.`, `${leftValue} ${answer} ${rightValue}.`),
  );
}

function mixedAdditionSubtractionTask(slot: LessonSlot, index: number): PracticeTask {
  if (index % 3 !== 2) {
    return targetedArithmeticTask(slot, index, index % 3 === 0 ? "add" : "subtract");
  }
  const seed = numberSeed(slot, index);
  const start = slot.grade === 1 ? 10 + seed % 5 : 30 + seed % 30;
  const step = slot.grade === 1 ? 1 + (seed >> 3) % 2 : 2 + (seed >> 3) % 8;
  const increasing = index % 2 === 0;
  const numbers = [start, start + (increasing ? step : -step), start + (increasing ? step * 2 : -step * 2)];
  const answer = numbers[2] + (increasing ? step : -step);
  return makeNumberTask(
    slot,
    index,
    text(`Продолжи закономерность: ${numbers.join(", ")}, …`, `Мыйзам ченемдүүлүктү улант: ${numbers.join(", ")}, …`),
    answer,
    text(`Каждый раз ${increasing ? "прибавляй" : "вычитай"} ${step}.`, `Ар жолу ${increasing ? `${step} кош` : `${step} кемит`}.`),
    text(`${numbers[2]} ${increasing ? "+" : "−"} ${step} = ${answer}.`, `${numbers[2]} ${increasing ? "+" : "−"} ${step} = ${answer}.`),
  );
}

function topicSpecificTask(slot: LessonSlot, index: number): PracticeTask | undefined {
  const key = `${slot.grade}-${slot.topic.sourceOrder}`;
  switch (key) {
    case "1-4":
      return countingCompositionTask(slot, index);
    case "1-6":
      return estimationTask(slot, index);
    case "1-7":
      return ordinalOrParityTask(slot, index);
    case "1-11":
    case "2-5":
      return numberLineTask(slot, index);
    case "1-8":
      return groupingComparisonTask(slot, index);
    case "1-13":
    case "2-2":
      return placeValueOrTensTask(slot, index);
    case "1-15":
    case "2-16":
      return shapeDimensionTask(slot, index);
    case "1-9":
    case "2-3":
      return mixedAdditionSubtractionTask(slot, index);
    case "1-16":
      return targetedArithmeticTask(slot, index, "add");
    case "1-17":
      return targetedArithmeticTask(slot, index, "subtract");
    case "1-19":
    case "1-24":
    case "1-32":
    case "2-17":
    case "2-22":
      return measurementByTopicTask(slot, index);
    case "1-20":
      return comparisonWordProblemTask(slot, index);
    case "1-21":
      return equationComponentTask(slot, index);
    case "2-19":
      return inverseOperationTask(slot, index);
    case "1-28":
      return inverseWordProblemTask(slot, index);
    case "1-22":
    case "1-23":
    case "2-25":
      return dataByTopicTask(slot, index);
    case "1-29":
    case "1-30":
    case "2-11":
      return fractionByTopicTask(slot, index);
    case "1-25":
      return brokenLineTask(slot, index);
    case "1-31":
      return rotationTask(slot, index);
    case "1-33":
      return dataClassificationTask(slot, index);
    case "2-1":
      return index % 3 === 0 ? roundingTask(slot, index) : numberTask(slot, index);
    case "2-4":
      return romanOrTensTask(slot, index);
    case "2-9":
      return matrixTask(slot, index);
    case "2-12":
      if (index % 2 === 0) return polygonPerimeterTask(slot, index);
      return makeNumberTask(slot, index, text("Ломаная состоит из отрезков длиной 3 см, 4 см и 5 см. Найди её длину.", "Сынык сызык 3 см, 4 см жана 5 см кесиндилеринен турат. Узундугун тап."), 12, text("Сложи длины всех звеньев.", "Бардык звенолордун узундуктарын кош."), text("3 + 4 + 5 = 12 см.", "3 + 4 + 5 = 12 см."), "3 см　／　4 см　＼　5 см");
    case "2-14":
      return polygonPerimeterTask(slot, index);
    case "2-15":
      return angleTask(slot, index);
    case "2-18":
      return index % 2 === 0
        ? makeNumberTask(slot, index, text("При a = 7 найди значение выражения a + 5.", "a = 7 болгондо a + 5 туюнтмасынын маанисин тап."), 12, text("Замени букву a известным числом.", "a тамгасынын ордуна белгилүү санды кой."), text("7 + 5 = 12.", "7 + 5 = 12."), "a + 5")
        : expressionTask(slot, index);
    case "2-21":
      return multiplicativeComparisonTask(slot, index);
    case "2-23":
      return multiStepWordProblemTask(slot, index);
    case "2-24":
      return expressionComparisonTask(slot, index);
    default:
      return undefined;
  }
}

export function hasTopicSpecificPractice(slot: LessonSlot): boolean {
  return topicSpecificTask(slot, 0) !== undefined;
}

function taskForFamily(family: TopicFamily, slot: LessonSlot, index: number): PracticeTask {
  const specificTask = topicSpecificTask(slot, index);
  if (specificTask) return specificTask;

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
  const topicObjectives: Record<string, LocalizedText> = {
    "1-4": text("Считать от 0 до 10 и раскладывать однозначные числа на части.", "0дөн 10го чейин санап, бир орундуу сандарды бөлүктөргө ажыратуу."),
    "1-6": text("Оценивать количество предметов до 20 и проверять оценку пересчётом.", "20га чейинки буюмдардын санын болжолдоп, кайра саноо менен текшерүү."),
    "1-9": text("Решать примеры на сложение и вычитание в пределах 20 и замечать числовые закономерности.", "20га чейинки кошуу-кемитүү мисалдарын чыгарып, сандык мыйзам ченемдүүлүктөрдү байкоо."),
    "1-16": text("Решать примеры и сюжетные задачи на сложение с ответом не больше 20.", "Жообу 20дан ашпаган кошуу мисалдарын жана сюжеттик маселелерди чыгаруу."),
    "1-17": text("Решать примеры и сюжетные задачи на вычитание.", "Кемитүү мисалдарын жана сюжеттик маселелерди чыгаруу."),
    "1-20": text("Находить разницу и решать задачи «на сколько больше» и «на сколько меньше».", "Айырманы таап, «канчага көп» жана «канчага аз» маселелерин чыгаруу."),
    "1-21": text("Находить неизвестное слагаемое, уменьшаемое и вычитаемое обратным действием.", "Белгисиз кошулуучуну, кемүүчүнү жана кемитүүчүнү тескери амал менен табуу."),
    "1-22": text("Читать и размещать данные в простых таблицах и пиктограммах.", "Жөнөкөй таблица жана пиктограммалардагы маалыматты окуу жана жайгаштыруу."),
    "1-23": text("Представлять данные описанием, списком и таблицей.", "Маалыматты сүрөттөмө, тизме жана таблица менен көрсөтүү."),
    "1-25": text("Составлять ломаную линию из отрезков и определять число её звеньев.", "Кесиндилерден сынык сызык түзүп, анын звенолорунун санын аныктоо."),
    "1-29": text("Делить целое на две одинаковые части — половины.", "Бүтүндү эки бирдей бөлүккө — жарымдарга бөлүү."),
    "1-30": text("Сравнивать равные и неравные части и составлять целое из частей.", "Тең жана тең эмес бөлүктөрдү салыштырып, бөлүктөрдөн бүтүн түзүү."),
    "1-32": text("Считывать температуру по термометру и сравнивать значения в градусах.", "Термометрден температураны окуп, градус маанилерин салыштыруу."),
    "2-1": text("Читать, сравнивать, упорядочивать и округлять числа в пределах 100.", "100гө чейинки сандарды окуу, салыштыруу, иреттөө жана тегеректөө."),
    "2-3": text("Складывать и вычитать в пределах 100, находить компоненты и продолжать закономерности.", "100гө чейинки сандарды кошуу-кемитүү, компоненттерин табуу жана мыйзам ченемдүүлүктөрдү улантуу."),
    "2-4": text("Читать римские цифры и работать с круглыми десятками.", "Рим цифраларын окуу жана тегерек ондуктар менен иштөө."),
    "2-9": text("Определять числа в строках и столбцах прямоугольной матрицы.", "Тик бурчтуу матрицанын саптарындагы жана мамычаларындагы сандарды аныктоо."),
    "2-11": text("Различать половины и четверти целого.", "Бүтүндүн жарымы менен төрттөн бирин айырмалоо."),
    "2-17": text("Выбирать подходящие единицы длины, массы, скорости, времени и денег.", "Узундук, масса, ылдамдык, убакыт жана акча үчүн ылайыктуу бирдиктерди тандоо."),
    "2-18": text("Соблюдать порядок действий и находить значения числовых и буквенных выражений.", "Амалдардын тартибин сактап, сандык жана тамгалуу туюнтмалардын маанисин табуу."),
    "2-19": text("Находить неизвестные компоненты сложения, вычитания, умножения и деления.", "Кошуу, кемитүү, көбөйтүү жана бөлүүнүн белгисиз компоненттерин табуу."),
    "2-21": text("Решать задачи «во сколько раз больше или меньше» и продолжать закономерности.", "«Канча эсе көп же аз» маселелерин чыгарып, мыйзам ченемдүүлүктөрдү улантуу."),
    "2-24": text("Сравнивать числа и значения выражений знаками равенства и неравенства.", "Сандарды жана туюнтмалардын маанилерин барабардык жана барабарсыздык белгилери менен салыштыруу."),
    "2-25": text("Собирать и группировать данные по двум признакам и читать таблицы и пиктограммы.", "Маалыматты эки белги боюнча чогултуу жана топтоо, таблица менен пиктограммаларды окуу."),
  };
  return topicObjectives[`${topic.grade}-${topic.sourceOrder}`] ?? objectives[topic.family];
}
