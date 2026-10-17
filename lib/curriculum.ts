export type TopicFamily =
  | "spatial"
  | "shapes"
  | "sorting"
  | "numbers"
  | "estimate"
  | "arithmetic"
  | "groups"
  | "number-line"
  | "place-value"
  | "word-problems"
  | "measurement"
  | "data"
  | "fractions"
  | "geometry"
  | "expressions"
  | "equations"
  | "multiplication"
  | "symmetry";

export type TranslationStatus = "draft-review-required";

export interface CurriculumTopic {
  id: string;
  grade: 1 | 2;
  sourceOrder: number;
  sourceNumber: number | null;
  hours: number;
  titleRu: string;
  titleKy: string;
  family: TopicFamily;
  sourcePage: number;
  translationStatus: TranslationStatus;
}

const draft = "draft-review-required" as const;

export const grade1Topics: CurriculumTopic[] = [
  { id: "g1-t01", grade: 1, sourceOrder: 1, sourceNumber: 1, hours: 4, family: "spatial", sourcePage: 2, translationStatus: draft, titleRu: "Ориентация в пространстве", titleKy: "Мейкиндикте багыт алуу" },
  { id: "g1-t02", grade: 1, sourceOrder: 2, sourceNumber: 2, hours: 3, family: "shapes", sourcePage: 2, translationStatus: draft, titleRu: "Простые геометрические фигуры", titleKy: "Жөнөкөй геометриялык фигуралар" },
  { id: "g1-t03", grade: 1, sourceOrder: 3, sourceNumber: 3, hours: 4, family: "sorting", sourcePage: 2, translationStatus: draft, titleRu: "Различать, группировать, сортировать и сравнивать предметы по цвету, размеру и форме", titleKy: "Буюмдарды түсү, өлчөмү жана формасы боюнча айырмалоо, топтоо, иреттөө жана салыштыруу" },
  { id: "g1-t04", grade: 1, sourceOrder: 4, sourceNumber: 4, hours: 6, family: "numbers", sourcePage: 2, translationStatus: draft, titleRu: "Счёт от 0 до 10, состав однозначных чисел и подготовка к письму цифр", titleKy: "0дөн 10го чейин саноо, бир орундуу сандардын курамы жана цифраларды жазууга даярдык" },
  { id: "g1-t05", grade: 1, sourceOrder: 5, sourceNumber: 5, hours: 6, family: "numbers", sourcePage: 2, translationStatus: draft, titleRu: "Нумерация, чтение, счёт и запись чисел от 0 до 20", titleKy: "0дөн 20га чейинки сандарды номерлөө, окуу, саноо жана жазуу" },
  { id: "g1-t06", grade: 1, sourceOrder: 6, sourceNumber: 6, hours: 2, family: "estimate", sourcePage: 2, translationStatus: draft, titleRu: "Приблизительное количество предметов до 20", titleKy: "20га чейинки буюмдардын болжолдуу санын аныктоо" },
  { id: "g1-t07", grade: 1, sourceOrder: 7, sourceNumber: 7, hours: 2, family: "numbers", sourcePage: 2, translationStatus: draft, titleRu: "Порядковые, чётные и нечётные числа; порядок и сравнение", titleKy: "Иреттик, жуп жана так сандар; ирети жана салыштыруу" },
  { id: "g1-t08", grade: 1, sourceOrder: 8, sourceNumber: 8, hours: 2, family: "sorting", sourcePage: 2, translationStatus: draft, titleRu: "Сравнение и упорядочивание групп предметов", titleKy: "Буюмдардын топторун салыштыруу жана иретке келтирүү" },
  { id: "g1-t09", grade: 1, sourceOrder: 9, sourceNumber: 9, hours: 4, family: "arithmetic", sourcePage: 2, translationStatus: draft, titleRu: "Сложение и вычитание в пределах 20; компоненты действий", titleKy: "20га чейинки кошуу жана кемитүү; амалдардын компоненттери" },
  { id: "g1-t10", grade: 1, sourceOrder: 10, sourceNumber: 10, hours: 2, family: "groups", sourcePage: 2, translationStatus: draft, titleRu: "Создание, удваивание, распределение и группировка пар чисел в пределах 20", titleKy: "20га чейинки сандарды түзүү, эки эселөө, бөлүштүрүү жана жуптап топтоо" },
  { id: "g1-t11", grade: 1, sourceOrder: 11, sourceNumber: 11, hours: 2, family: "number-line", sourcePage: 2, translationStatus: draft, titleRu: "Размещение и сравнение чисел на числовом луче", titleKy: "Сандарды сан нурунда жайгаштыруу жана салыштыруу" },
  { id: "g1-t12", grade: 1, sourceOrder: 12, sourceNumber: 12, hours: 2, family: "arithmetic", sourcePage: 2, translationStatus: draft, titleRu: "Связь между сложением и вычитанием", titleKy: "Кошуу менен кемитүүнүн байланышы" },
  { id: "g1-t13", grade: 1, sourceOrder: 13, sourceNumber: 13, hours: 6, family: "place-value", sourcePage: 2, translationStatus: draft, titleRu: "Десятки и единицы; таблицы сложения и вычитания", titleKy: "Ондуктар жана бирдиктер; кошуу жана кемитүү таблицалары" },
  { id: "g1-t14", grade: 1, sourceOrder: 14, sourceNumber: 14, hours: 1, family: "spatial", sourcePage: 2, translationStatus: draft, titleRu: "Расположение объектов в пространстве", titleKy: "Объекттердин мейкиндикте жайгашуусу" },
  { id: "g1-t15", grade: 1, sourceOrder: 15, sourceNumber: 15, hours: 2, family: "shapes", sourcePage: 2, translationStatus: draft, titleRu: "Плоские (2D) и объёмные (3D) фигуры и их различия", titleKy: "Жалпак (2D) жана көлөмдүү (3D) фигуралар жана алардын айырмасы" },
  { id: "g1-t16", grade: 1, sourceOrder: 16, sourceNumber: 16, hours: 2, family: "word-problems", sourcePage: 2, translationStatus: draft, titleRu: "Примеры и задачи на сложение с суммой не более 20", titleKy: "Жыйынтыгы 20дан ашпаган кошуу мисалдары жана маселелери" },
  { id: "g1-t17", grade: 1, sourceOrder: 17, sourceNumber: 17, hours: 2, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Примеры и задачи на вычитание", titleKy: "Кемитүүгө мисалдар жана маселелер" },
  { id: "g1-t18", grade: 1, sourceOrder: 18, sourceNumber: 18, hours: 2, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Сложение и вычитание по предметным сюжетным изображениям", titleKy: "Предметтик жана сюжеттик сүрөттөр боюнча кошуу жана кемитүү" },
  { id: "g1-t19", grade: 1, sourceOrder: 19, sourceNumber: 19, hours: 1, family: "measurement", sourcePage: 3, translationStatus: draft, titleRu: "Отрезок и его длина", titleKy: "Кесинди жана анын узундугу" },
  { id: "g1-t20", grade: 1, sourceOrder: 20, sourceNumber: 20, hours: 3, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Задачи «на сколько больше» и «на сколько меньше»", titleKy: "«Канчага көп» жана «канчага аз» маселелери" },
  { id: "g1-t21", grade: 1, sourceOrder: 21, sourceNumber: 21, hours: 3, family: "equations", sourcePage: 3, translationStatus: draft, titleRu: "Неизвестное слагаемое, уменьшаемое и вычитаемое", titleKy: "Белгисиз кошулуучу, кемүүчү жана кемитүүчү" },
  { id: "g1-t22", grade: 1, sourceOrder: 22, sourceNumber: 22, hours: 3, family: "data", sourcePage: 3, translationStatus: draft, titleRu: "Чтение и размещение данных в простейших таблицах и пиктограммах", titleKy: "Жөнөкөй таблицалардагы жана пиктограммалардагы маалыматты окуу жана жайгаштыруу" },
  { id: "g1-t23", grade: 1, sourceOrder: 23, sourceNumber: 23, hours: 3, family: "data", sourcePage: 3, translationStatus: draft, titleRu: "Представление данных описаниями, списками и таблицами", titleKy: "Маалыматты сүрөттөө, тизме жана таблица аркылуу көрсөтүү" },
  { id: "g1-t24", grade: 1, sourceOrder: 24, sourceNumber: 24, hours: 10, family: "measurement", sourcePage: 3, translationStatus: draft, titleRu: "Длина, масса, время, цена и стоимость; единицы и действия с именованными числами", titleKy: "Узундук, масса, убакыт, баа жана нарк; өлчөө бирдиктери жана аттуу сандар менен амалдар" },
  { id: "g1-t25", grade: 1, sourceOrder: 25, sourceNumber: 25, hours: 1, family: "geometry", sourcePage: 3, translationStatus: draft, titleRu: "Создание ломаной линии из отрезков", titleKy: "Кесиндилерден сынык сызык түзүү" },
  { id: "g1-t26", grade: 1, sourceOrder: 26, sourceNumber: 26, hours: 3, family: "expressions", sourcePage: 3, translationStatus: draft, titleRu: "Простые числовые выражения; сравнение чисел и выражений", titleKy: "Жөнөкөй сандык туюнтмалар; сандарды жана туюнтмаларды салыштыруу" },
  { id: "g1-t27", grade: 1, sourceOrder: 27, sourceNumber: 27, hours: 2, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Создание и решение ситуационных задач по изображениям", titleKy: "Сүрөттөр боюнча кырдаалдык маселелерди түзүү жана чыгаруу" },
  { id: "g1-t28", grade: 1, sourceOrder: 28, sourceNumber: 28, hours: 2, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Создание задач, обратных данной", titleKy: "Берилген маселеге тескери маселе түзүү" },
  { id: "g1-t29", grade: 1, sourceOrder: 29, sourceNumber: 29, hours: 1, family: "fractions", sourcePage: 3, translationStatus: draft, titleRu: "Разделение целого на две части (половины)", titleKy: "Бүтүндү эки бөлүккө (жарымдарга) бөлүү" },
  { id: "g1-t30", grade: 1, sourceOrder: 30, sourceNumber: 30, hours: 4, family: "fractions", sourcePage: 3, translationStatus: draft, titleRu: "Равные и неравные части; создание целого из частей", titleKy: "Тең жана тең эмес бөлүктөр; бөлүктөрдөн бүтүн түзүү" },
  { id: "g1-t31", grade: 1, sourceOrder: 31, sourceNumber: 31, hours: 2, family: "spatial", sourcePage: 3, translationStatus: draft, titleRu: "Поворот и определение положения фигур", titleKy: "Фигураларды буруу жана алардын абалын аныктоо" },
  { id: "g1-t32", grade: 1, sourceOrder: 32, sourceNumber: 32, hours: 1, family: "measurement", sourcePage: 3, translationStatus: draft, titleRu: "Термометр", titleKy: "Термометр" },
  { id: "g1-t33", grade: 1, sourceOrder: 33, sourceNumber: 33, hours: 3, family: "data", sourcePage: 3, translationStatus: draft, titleRu: "Диаграммы Кэрролла и Венна", titleKy: "Кэрролл жана Венн диаграммалары" },
];

export const grade2Topics: CurriculumTopic[] = [
  { id: "g2-t01", grade: 2, sourceOrder: 1, sourceNumber: 1, hours: 12, family: "numbers", sourcePage: 2, translationStatus: draft, titleRu: "Числа в пределах 100: нумерация, чтение, запись, чётность, сравнение и округление", titleKy: "100гө чейинки сандар: номерлөө, окуу, жазуу, жуптук, салыштыруу жана тегеректөө" },
  { id: "g2-t02", grade: 2, sourceOrder: 2, sourceNumber: null, hours: 3, family: "place-value", sourcePage: 2, translationStatus: draft, titleRu: "Разложение и формирование чисел на составные", titleKy: "Сандарды разряддык курамга ажыратуу жана түзүү" },
  { id: "g2-t03", grade: 2, sourceOrder: 3, sourceNumber: 2, hours: 14, family: "arithmetic", sourcePage: 2, translationStatus: draft, titleRu: "Сложение и вычитание в пределах 100; компоненты, задачи и закономерности", titleKy: "100гө чейинки кошуу жана кемитүү; компоненттер, маселелер жана мыйзам ченемдүүлүктөр" },
  { id: "g2-t04", grade: 2, sourceOrder: 4, sourceNumber: 3, hours: 2, family: "numbers", sourcePage: 2, translationStatus: draft, titleRu: "Римские цифры и круглые десятки", titleKy: "Рим цифралары жана тегерек ондуктар" },
  { id: "g2-t05", grade: 2, sourceOrder: 5, sourceNumber: 4, hours: 1, family: "number-line", sourcePage: 2, translationStatus: draft, titleRu: "Числовой ряд", titleKy: "Сан катары" },
  { id: "g2-t06", grade: 2, sourceOrder: 6, sourceNumber: 5, hours: 6, family: "multiplication", sourcePage: 2, translationStatus: draft, titleRu: "Компоненты, свойства и связь умножения и деления", titleKy: "Көбөйтүү менен бөлүүнүн компоненттери, касиеттери жана байланышы" },
  { id: "g2-t07", grade: 2, sourceOrder: 7, sourceNumber: 6, hours: 4, family: "groups", sourcePage: 2, translationStatus: draft, titleRu: "Сложение и умножение одинаковых групп", titleKy: "Бирдей топторду кошуу жана көбөйтүү" },
  { id: "g2-t08", grade: 2, sourceOrder: 8, sourceNumber: 7, hours: 2, family: "multiplication", sourcePage: 2, translationStatus: draft, titleRu: "Связь действий умножения и деления", titleKy: "Көбөйтүү жана бөлүү амалдарынын байланышы" },
  { id: "g2-t09", grade: 2, sourceOrder: 9, sourceNumber: 8, hours: 1, family: "data", sourcePage: 2, translationStatus: draft, titleRu: "Числа в строках и столбцах прямоугольной матрицы", titleKy: "Тик бурчтуу матрицанын саптарындагы жана мамычаларындагы сандар" },
  { id: "g2-t10", grade: 2, sourceOrder: 10, sourceNumber: 9, hours: 12, family: "expressions", sourcePage: 2, translationStatus: draft, titleRu: "Выражения в скобках и задачи на сложение и вычитание в пределах 100", titleKy: "Кашаалуу туюнтмалар жана 100гө чейинки кошуу-кемитүү маселелери" },
  { id: "g2-t11", grade: 2, sourceOrder: 11, sourceNumber: 10, hours: 4, family: "fractions", sourcePage: 2, translationStatus: draft, titleRu: "Половины и четверти целого", titleKy: "Бүтүндүн жарымы жана төрттөн бири" },
  { id: "g2-t12", grade: 2, sourceOrder: 12, sourceNumber: 11, hours: 10, family: "geometry", sourcePage: 2, translationStatus: draft, titleRu: "Свойства многоугольников; длина отрезка и ломаной", titleKy: "Көп бурчтуктардын касиеттери; кесиндинин жана сынык сызыктын узундугу" },
  { id: "g2-t13", grade: 2, sourceOrder: 13, sourceNumber: 12, hours: 3, family: "spatial", sourcePage: 2, translationStatus: draft, titleRu: "Относительное расположение объектов на плоскости и в пространстве", titleKy: "Объекттердин тегиздикте жана мейкиндикте өз ара жайгашуусу" },
  { id: "g2-t14", grade: 2, sourceOrder: 14, sourceNumber: 13, hours: 3, family: "geometry", sourcePage: 2, translationStatus: draft, titleRu: "Многоугольники и их периметры", titleKy: "Көп бурчтуктар жана алардын периметрлери" },
  { id: "g2-t15", grade: 2, sourceOrder: 15, sourceNumber: 15, hours: 4, family: "geometry", sourcePage: 2, translationStatus: draft, titleRu: "Угол, прямоугольник и квадрат", titleKy: "Бурч, тик бурчтук жана квадрат" },
  { id: "g2-t16", grade: 2, sourceOrder: 16, sourceNumber: 16, hours: 4, family: "shapes", sourcePage: 2, translationStatus: draft, titleRu: "Плоские (2D) и трёхмерные (3D) формы, свойства и примеры", titleKy: "Жалпак (2D) жана үч өлчөмдүү (3D) формалар, касиеттери жана мисалдары" },
  { id: "g2-t17", grade: 2, sourceOrder: 17, sourceNumber: 17, hours: 5, family: "measurement", sourcePage: 3, translationStatus: draft, titleRu: "Единицы длины, массы, скорости, времени и деньги Кыргызской Республики", titleKy: "Узундук, масса, ылдамдык, убакыт бирдиктери жана Кыргыз Республикасынын акчалары" },
  { id: "g2-t18", grade: 2, sourceOrder: 18, sourceNumber: 18, hours: 5, family: "expressions", sourcePage: 3, translationStatus: draft, titleRu: "Порядок действий; числовые и буквенные выражения", titleKy: "Амалдардын тартиби; сандык жана тамгалуу туюнтмалар" },
  { id: "g2-t19", grade: 2, sourceOrder: 19, sourceNumber: 19, hours: 8, family: "equations", sourcePage: 3, translationStatus: draft, titleRu: "Уравнения и неизвестные компоненты четырёх действий", titleKy: "Теңдемелер жана төрт амалдын белгисиз компоненттери" },
  { id: "g2-t20", grade: 2, sourceOrder: 20, sourceNumber: 20, hours: 2, family: "symmetry", sourcePage: 3, translationStatus: draft, titleRu: "Симметрия и линия симметрии", titleKy: "Симметрия жана симметрия сызыгы" },
  { id: "g2-t21", grade: 2, sourceOrder: 21, sourceNumber: 21, hours: 5, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Задачи «во много раз меньше/больше» и закономерности", titleKy: "«Бир нече эсе аз/көп» маселелери жана мыйзам ченемдүүлүктөр" },
  { id: "g2-t22", grade: 2, sourceOrder: 22, sourceNumber: 22, hours: 5, family: "measurement", sourcePage: 3, translationStatus: draft, titleRu: "Задачи с величинами и единицами измерения", titleKy: "Чоңдуктар жана өлчөө бирдиктери менен маселелер" },
  { id: "g2-t23", grade: 2, sourceOrder: 23, sourceNumber: 23, hours: 5, family: "word-problems", sourcePage: 3, translationStatus: draft, titleRu: "Задачи и выражения в 1–2 действия по условию, схеме и изображению", titleKy: "Шарт, схема жана сүрөт боюнча 1–2 амалдуу маселелер жана туюнтмалар" },
  { id: "g2-t24", grade: 2, sourceOrder: 24, sourceNumber: 24, hours: 4, family: "expressions", sourcePage: 3, translationStatus: draft, titleRu: "Равенства и неравенства чисел и выражений", titleKy: "Сандардын жана туюнтмалардын барабардыктары жана барабарсыздыктары" },
  { id: "g2-t25", grade: 2, sourceOrder: 25, sourceNumber: 25, hours: 8, family: "data", sourcePage: 3, translationStatus: draft, titleRu: "Таблицы и пиктограммы двух категорий; сбор и группировка данных", titleKy: "Эки категориялуу таблицалар жана пиктограммалар; маалыматтарды чогултуу жана топтоо" },
];

export const curriculumByGrade = {
  1: grade1Topics,
  2: grade2Topics,
} as const;

export interface LessonSlot {
  id: string;
  grade: 1 | 2;
  topic: CurriculumTopic;
  part: number;
  globalHour: number;
}

export function totalHours(topics: readonly CurriculumTopic[]): number {
  return topics.reduce((sum, topic) => sum + topic.hours, 0);
}

export function expandLessonSlots(grade: 1 | 2): LessonSlot[] {
  let globalHour = 0;
  return curriculumByGrade[grade].flatMap((topic) =>
    Array.from({ length: topic.hours }, (_, index) => {
      globalHour += 1;
      return {
        id: `${topic.id}-h${index + 1}`,
        grade,
        topic,
        part: index + 1,
        globalHour,
      };
    }),
  );
}

export function getTopic(grade: number, sourceOrder: number): CurriculumTopic | undefined {
  if (grade !== 1 && grade !== 2) return undefined;
  return curriculumByGrade[grade].find((topic) => topic.sourceOrder === sourceOrder);
}

export function getLessonSlot(grade: number, sourceOrder: number, part: number): LessonSlot | undefined {
  if (grade !== 1 && grade !== 2) return undefined;
  return expandLessonSlots(grade).find(
    (slot) => slot.topic.sourceOrder === sourceOrder && slot.part === part,
  );
}

export const curriculumFacts = {
  academicYear: "2026/2027",
  grade1: { topicRows: 33, hours: 96, weeklyHours: 3, sourcePages: 3 },
  grade2: { topicRows: 25, hours: 132, weeklyHours: 4, sourcePages: 4 },
  totalPublishedRows: 58,
  totalHours: 228,
  provenanceStatus: "example-ktp-unverified-approval",
  translationStatus: draft,
} as const;
