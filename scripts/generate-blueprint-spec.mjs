import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(root, "task", "SANAK_Blueprint_163_topics.json");
const outputPath = resolve(root, "docs", "BILIM_Architectural_Educational_Blueprint_v1.1.md");
const blueprint = JSON.parse(await readFile(inputPath, "utf8"));

const expectedTracks = [
  { grade: "1 класс", track: "KG12", count: 33, hours: 96 },
  { grade: "2 класс", track: "KG12", count: 25, hours: 132 },
  { grade: "3 класс", track: "KG12", count: 41, hours: 136 },
  { grade: "3 кл. 11 лет", track: "KG11_TRANSITION", count: 19, hours: 170 },
  { grade: "4 класс", track: "KG11_TRANSITION", count: 26, hours: 170 },
  { grade: "5 класс", track: "KG12_INTEGRATED", count: 19, hours: 170 },
];
const requiredSpecKeys = [
  "category", "goal", "context", "demo", "task", "validator", "control",
  "voice", "test", "error1", "error2", "error3", "animation", "audio",
];

if (blueprint.version !== "1.0" || !Array.isArray(blueprint.topics) || blueprint.topics.length !== 163) {
  throw new Error(`Expected SANAK Blueprint v1.0 with 163 topic passports: ${inputPath}`);
}

const passportIds = new Set();
for (const expected of expectedTracks) {
  const topics = blueprint.topics.filter((topic) => topic.grade === expected.grade && topic.track === expected.track);
  const hours = topics.reduce((sum, topic) => sum + topic.hours, 0);
  if (topics.length !== expected.count || hours !== expected.hours) {
    throw new Error(`Track invariant failed for ${expected.track}/${expected.grade}: ${topics.length} topics, ${hours} hours.`);
  }
  for (const topic of topics) {
    if (passportIds.has(topic.id)) throw new Error(`Duplicate topic passport id: ${topic.id}`);
    passportIds.add(topic.id);
    const missing = requiredSpecKeys.filter((key) => topic.spec?.[key] === undefined || topic.spec[key] === "");
    if (missing.length > 0 || !Array.isArray(topic.spec.voice) || topic.spec.voice.length !== 4) {
      throw new Error(`Topic ${topic.id} has incomplete specification fields: ${missing.join(", ")}.`);
    }
  }
}

const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const quote = (value) => String(value).trim();
const phaseNames = {
  A: "Зацепка и постановка вопроса",
  B: "Демонстрация принципа",
  C: "Действие ученика",
  D: "Проверка, перенос и рефлексия",
};

function renderGlobalSpecification() {
  return `# BILIM — Architectural & Educational Blueprint
## Техническое задание и методический спецификатор интерактивных уроков математики, 1–5 классы

**Версия документа:** 1.1 (детализированная, машинно сформированная)  
**Дата:** 16 октября 2026 г.  
**Предмет:** математика; русский и кыргызский языки интерфейса и обучения  
**Исходная спецификация:** SANAK Architectural & Educational Blueprint v1.0 и его JSON-реестр 163 тематических паспортов  
**Назначение:** контракт для AI-генератора пользовательских интерфейсов, интерактивных уроков, валидаторов, анимаций, аудио-событий и приёмочных тестов.

> **Ограничение статуса.** Этот документ — проектная техническая и методическая спецификация, а не утверждённая государственная программа, стандарт Минпросвещения/Минобразования КР или одобренный учебник. Сведения КТП указываются как provenance источника JSON; проектные сценарии, примеры, переводы, упражнения, игровые образы, validators и кодовые подсказки остаются черновиками. Никакой урок нельзя публиковать или представлять утверждённым до независимой математической, педагогической, русской и кыргызской проверки, проверки доступности и QA.

## Паспорт документа и правила прочтения

| Поле | Значение |
|---|---|
| Исходный объём | 163 паспорта, 874 академических часа по шести учебным траекториям |
| Основной набор без альтернативного KG11 третьего класса | 704 часа: 1/2/KG12-3/KG11-4/KG12-integrated-5 |
| Альтернативная траектория | KG11_TRANSITION, 3 класс, 19 паспортов/170 ч.; не объединять с KG12-3 |
| Расчётные недели | Плановые диапазоны из JSON, не даты школьного расписания |
| Сценарии | Авторские проектные предложения; тексты из JSON приводятся как исходные черновики, не как выверенные реплики |
| Генерация | JSON детерминированно формирует паспорт и заготовку; не утверждает содержимое и не исполняет строку validator |
| Приоритет при конфликте | Для названия/часов/provenance — конкретная запись JSON; для реализации и QA — требования этого раздела; при любом содержательном конфликте публикация блокируется до решения методиста |

## Содержание

1. Границы, происхождение и учебные траектории  
2. Глобальные технические, визуальные и педагогические требования  
3. Runtime-контракт урока: состояния, события, прогресс и генерация заданий  
4. Проверка качества, статусы контента, локализация и безопасность  
5. Паспорта тем по классам и учебным траекториям (все 163)
6. Критерии приёмки

## 1. Границы и исходные данные

### 1.1 Учебные треки

| Класс/трек | Топиков | Академических часов | Источник и ограничение |
|---|---:|---:|---|
| 1 класс — KG12 | 33 | 96 | Последовательность/часы перенесены из указанного в JSON КТП; проект урока требует ревью |
| 2 класс — KG12 | 25 | 132 | Последовательность/часы перенесены из указанного в JSON КТП; проект урока требует ревью |
| 3 класс — KG12 | 41 | 136 | Отдельный KG12 трек; не смешивать с 11-летним третьим классом |
| 3 класс — KG11_TRANSITION | 19 | 170 | Переходная 11-летняя траектория; детализация проектная |
| 4 класс — KG11_TRANSITION | 26 | 170 | Переходная траектория; проверять применимость и источник каждого блока |
| 5 класс — KG12_INTEGRATED | 19 | 170 | Интегрированная траектория; не переклассифицировать в иной трек без подтверждения |
| **Всего** | **163** | **874** | Сумма включает альтернативную версию 3 класса |

Часы темы порождают серию различных уроков, а не одну копию сценария. Для нескольких часов в теме каждый час должен получить отдельную цель действия, числа/условия, вариант микро-теста и домашнее задание; повтор одного и того же ответа без новой модели или переноса запрещён. Не подставлять фактические календарные даты при наличии только расчётной недели.

### 1.2 Структура записи и provenance

Каждый паспорт обязан сохранять: \`id\`, \`track\`, \`grade\`, \`idx\`, \`topic\`, \`hours\`, \`start_hour\`, \`end_hour\`, \`source\`, \`status\`, \`week_start\`, \`week_end\`, а также все ключи \`spec\`. Импорт не должен терять исходную строку, пунктуацию, число, математическую операцию либо статус источника. Не считать описательную строку \`validator\` исполняемым выражением: реализация требует отдельного типизированного и протестированного валидатора.

### 1.3 Контекст Кыргызской Республики

- Контекст, уже указанный в конкретном паспорте (\`context\`), задаёт исходный визуальный объект. Генератор может конкретизировать его только безопасной нейтральной иллюстрацией, не приписывая объекту ложных культурных или бытовых свойств.
- Допустимые объектные мотивы — только как декорация задачи: узор шырдака, части юрты, комуз, учебные принадлежности, фрукты и местность КР, простые бытовые ситуации, сом/тыйын. Денежный сюжет использовать лишь когда математическая цель и возрастной курс это поддерживают; деньги в вычислениях представлены целыми тыйынами, без binary floating-point.
- Не выдумывать «стандарты Минобразования КР». До утверждения методистом обозначать соответствие программе как \`pending\`; если исходный официальный документ недоступен или лицензия сомнительна, ограничить вывод метаданными и запросить правообладателя.
- Национальный/региональный образ не должен быть условием решения: навык, числа и ответ остаются одинаковыми при нейтральной замене декорации.

## 2. Глобальные технические и методические требования

### 2.1 Учебная структура и время

| Фаза | Сценарный ориентир | Обязательное назначение | Runtime-переход |
|---|---:|---|---|
| A — hook | 0:00–0:30 | 2D/доступный персонаж или сцена, знакомая проблема, один открытый вопрос | только по явному действию ученика |
| B — demonstration | 0:30–1:10 | предмет → схема/модель → математическая запись; выделить связь, не дать только правило | после завершения демонстрации/явной кнопки продолжения |
| C — practice | 1:10–1:50 | короткая управляемая попытка ученика, keyboard/touch эквивалент | после проверки ответа и обратной связи |
| D — reflection/check | 1:50–2:10+ | независимая задача, объяснение/перенос, мягкое резюме и награда | завершить лишь после критерия освоения |

130 секунд — нижняя граница базового storyboard/озвучки, а не лимит времени ребёнка и не требование переходить автоматически по таймеру. Думание, чтение, повтор, пауза и аудио должны быть доступны без штрафа. Расширенный учебный сеанс проектировать в среднем на 20–25 минут вместе с практикой, тестом и домашним заданием; это плановый диапазон, не таймер. Микротест каждого полноценного урока содержит не менее **10** различных задач/вариантов и оценивает независимый перенос; домашняя работа содержит **5–8** коротких действий на тему. Если паспорт даёт только одну проверочную идею, генератор обязан породить параметризованные параллельные варианты и блокировать выдачу, пока арифметика и неоднозначность вариантов не протестированы.

### 2.2 Педагогическая последовательность

1. **Concrete:** показать манипулятивные предметы/объекты с количеством и ориентирами, доступными зрению и озвучке.
2. **Pictorial:** явно преобразовать те же объекты в ряд, таблицу, схему, числовую прямую, диаграмму или фигуру.
3. **Abstract:** ввести знак, выражение, единицу, отношение или алгоритм; связать каждую часть записи с моделью.
4. **Guided attempt:** предложить действие без подсказанного ответа; оценивать математическое свойство, а не скорость.
5. **Independent transfer:** новый сюжет/ракурс/числа; не копировать demonstration values.
6. После неверного ответа не раскрывать ключ: уровень 1 — фокус внимания на шаге; уровень 2 — более простая/иная схема аналогичного примера; уровень 3 — совместный разбор и затем новый независимый пример. Давать право попробовать снова.

### 2.3 Визуальная система и компоненты

| Токен | Требование |
|---|---|
| Фон / поверхность / текст | Спокойный пастельный фон \`#F7F8FE\`, поверхность \`#FFFFFF\`, текст \`#203047\`; existing product palette may map to equivalents only if contrast is maintained |
| Акцент / успех / мягкая ошибка | Синий \`#4C70E8\`, бирюзовый \`#22A99B\`, янтарный \`#F5B94E\`, мягкий янтарно-коралловый \`#E8A95B\`; цвет никогда не единственный маркер |
| Шрифт | Лицензированный Nunito/скруглённый sans-serif или системный fallback с кириллицей и ң, ө, ү; Comic Sans не является обязательным и не встраивается без лицензии |
| Размер | Цель: 18–20 CSS px в 1–2 классах; 16–18 px в 3–5; увеличить системным масштабом без обрезки |
| Нажатие | Интерактивная область не меньше 44×44 CSS px; видимый focus; ясная подпись; отступы без случайных соседних нажатий |
| Смысл | Сохранять форму/подпись/позицию/паттерн в дополнение к цвету; контраст WCAG 2.2 AA проверить инструментом и вручную |

### 2.4 Персонаж и режиссура сцен

- Персонаж-проводник (рабочее имя Жылдыз при наличии лицензированной оригинальной иллюстрации) помогает наблюдать и задавать вопрос, но не сообщает правильный ответ. Не создавать карикатурные национальные костюмы или неподтверждённые культурные свойства объектов.
- A: появление персонажа с края viewport: \`opacity 0→1\` + \`translateX(12px→0)\`, 250 ms. На desktop ориентир x=8%, y=72%, на мобильном x=8%, y=78%; ширина ограничена 18–26% доступной сцены. Не перекрывать карточку вопроса, субтитры и hit targets.
- B: взгляд/жест указывает на текущий элемент модели; подсветка математического шага совпадает с репликой. Смысл должен оставаться понятен при выключенном звуке и без визуального gaze.
- C: персонаж остаётся в спокойной боковой позе и не указывает на answer key или target. D: однократная короткая реакция на освоение; никаких рейтингов/сравнений детей.
- Движение — иллюстрация причинно-следственной модели, а не непрерывная «физика». Гравитацию, столкновение и инерцию включать только если они математически значимы; точность оценивает pure validator независимо от отрисовки.

### 2.5 Motion и drag/touch

- Таргет 60 FPS — измеряемая цель, не гарантия. В основном анимировать \`transform\`/\`opacity\`; не запускать layout thrashing/частицы постоянно.
- Событийная библиотека: \`scene_enter → fade_in 250 ms\`; \`object_pick → scale 1.04, 90 ms\`; \`hover_target → pulse 800 ms\`; \`drop_near → подсветка зоны\`; \`answer_correct → snap 180 ms + bounce 240 ms\`; \`answer_incorrect → короткий статический focus/fade, без тряски\`; \`lesson_complete → particle_burst до 900 ms один раз\`.
- Snap-to-grid: конфигурируемая зона прицеливания 12–18 CSS px; математический валидатор применяет координатную/геометрическую точность из паспорта, а не произвольный визуальный радиус.
- Pointer Events: \`pointerdown\` фиксирует id объекта/исходные координаты; \`pointermove\` меняет только transform; \`pointerup\` вычисляет положение, проходит pure validator, затем snap либо возврат с подсказкой; \`pointercancel\` восстанавливает исходное состояние. Нельзя проверять только цвет подсветки или клиентский DOM target.
- Keyboard alternative: сфокусировать объект, Enter/Space — pick; стрелки/таб-кнопки — выбрать целевую зону; Enter/Space — drop; Escape — отмена. Обеспечить скринридерное объявление выбранного объекта, цели и результата.
- \`prefers-reduced-motion: reduce\`: убрать непрерывное движение, scale/bounce/частицы; оставить статическую схему и короткий fade либо мгновенное состояние.

### 2.6 Audio, narration и речь

| Канал | Значение по умолчанию | Поведение |
|---|---:|---|
| Narration | 80% | Только после пользовательского действия; пауза, повтор, субтитры; синхронизация необязательна и не должна задерживать управление |
| SFX | 35% | Короткие, мягкие и различимые сигналы; независимое отключение |
| Music/ambient | 0% | Выключен по умолчанию; не маскирует голос/субтитры; не запускать до gesture |

Стандартные семантические события: \`scene_start\`, \`tap\`, \`drag_start\`, \`drop_near\`, \`answer_correct\`, \`answer_incorrect\`, \`hint_level_1/2/3\`, \`lesson_complete\`. Тон ошибки нейтрален и мягок, никогда не используется резкий «wrong»/красный крест. Каждый звуковой сигнал имеет текстовую, визуальную и keyboard-accessible альтернативу. Предлагаемые имена файлов в паспортах — условные asset keys, не подтверждение наличия лицензированного аудио.

### 2.7 Типизированная математика

- Детерминированные валидаторы с входной схемой, единицами, границами, допустимыми эквивалентными представлениями и explanation. Не вычислять сырую строку через \`eval\`/Function/динамический код.
- Целые: safe integer или BigInt и явные пределы; сравнить тип, знак и границу, запретить NaN/Infinity/дробное значение там, где требуется целое.
- Дроби: числитель/ненулевой знаменатель, нормализация знака и gcd; сравнение через BigInt cross multiplication, чтобы избежать overflow. Десятичное округление только по специфицированному правилу.
- Деньги: целые тыйыны, формат/округление по явной учебной постановке; не смешивать сом и тыйын без указанного масштаба.
- Геометрия: конечные координаты/длины, валидная топология (если полигон), единицы, допуск только из условия; площадь/периметр считать по целочисленной сетке или безопасному рациональному представлению.
- Данные/статистика: проверять непустой массив, числовую область, длину и выбранную convention для медианы/моды/округления; никакой молчаливой сортировки строк как чисел.
- Вероятность/множества/комбинаторика: явно определить пространство исходов, учёт порядка и повторов, единицы вероятности и граничные случаи.
- Текстовая задача: проверить выбранную модель, операцию, число и размерность/единицу; разрешить математически эквивалентную стратегию, если её описали правила задачи.

### 2.8 Оценивание и подсказки

- Не штрафовать за время; хранить число попыток, выбранный hint level и итог, не только бинарный score.
- Тест: минимум 10 проверяемых заданий для каждого полного урока: 2 на чтение модели/понятия, 3 на применение с новыми данными, 3 на связь представлений/обратную проверку/рассуждение и 2 на новый контекст и перенос. Если это выходит за подтверждённый уровень темы, меняется сложность рассуждения, но не добавляется материал за пределами трека.
- Целевой порог пилота — не ниже 8/10 для перехода к домашнему заданию. Это предварительное проектное значение; публикуемый порог устанавливает методист после апробации, не генератор.
- После теста показать счёт/разбор ошибки без сравнения с другими детьми; при непрохождении предложить новый набор с изменённым порядком/значениями/ракурсом, не выдавая правильный ответ до разбора.
- Не повторять один и тот же вопрос с теми же объектами как новый независимый пункт; сохранять недвусмысленную формулировку и единственный правильный ответ либо документировать эквивалентные ответы.

## 3. Runtime-контракт и архитектура генератора

### 3.1 Состояния и события

\`\`\`typescript
type LessonPhase = "A" | "B" | "C" | "D";
type LessonState =
  | "Initial" | "Intro" | "Demonstration" | "User_Interaction"
  | "Validation_Success" | "Validation_Error"
  | "Scaffold_Level_1" | "Scaffold_Level_2" | "Guided_Resolution"
  | "Microtest" | "Lesson_Complete" | "Homework";

type ReviewStatus =
  | "draft" | "math_review" | "pedagogy_review"
  | "localization_review" | "qa" | "approved" | "published";

type MathValidator =
  | { kind: "integer-equality"; expected: number; min?: number; max?: number }
  | { kind: "comparison"; left: number; right: number }
  | { kind: "fraction-equality"; numerator: string; denominator: string }
  | { kind: "spatial-position"; expected: "left" | "right" | "above" | "below" }
  | { kind: "choice-equality"; expected: string }
  | { kind: "polygon-perimeter"; edges: number[]; expected: number };

interface AttemptEvent {
  event_id: string;
  lesson_id: string;
  exercise_id: string;
  session_id: string;
  action: string;
  payload_schema_version: number;
  timestamp: string;
  duration_ms: number;
  hint_level: 0 | 1 | 2 | 3;
}
\`\`\`

Переходы только после явного UI-события: \`SUBMIT(valid)\` → \`Validation_Success\`; \`SUBMIT(invalid)\` → \`Validation_Error\` → соответствующая подсказка → \`User_Interaction\`; три ошибки приводят к \`Guided_Resolution\` и новому варианту; успешная практика → \`Microtest\`; только пороговый результат → \`Lesson_Complete\` и домашняя работа. Запрещён переход только по \`setTimeout\`, времени озвучки или потере фокуса.

### 3.2 Поля LessonSpec

\`\`\`typescript
interface LessonSpec {
  id: string; track: "KG12" | "KG11_TRANSITION" | "KG12_INTEGRATED";
  grade: number; topicIndex: number; academicYear: string;
  hours: number; estimatedWeekStart: number; estimatedWeekEnd: number;
  sourceUrl: string; sourceStatus: string; reviewStatus: ReviewStatus;
  objective: string; context: string;
  scenes: Array<{
    id: "A" | "B" | "C" | "D";
    targetSeconds: number; narration: { ru: string; ky?: string };
    visualModel: string; learnerAction?: string; triggers: string[];
  }>;
  validator: MathValidator; variants: unknown[];
  errors: { first: string; second: string; third: string };
  assessment: { minimumItems: 10; passRate: number; independentTransfer: boolean };
  homework: { minimumItems: 5; maximumItems: 8; tasks: unknown[] };
  approvals: { math: string; pedagogy: string; russian: string; kyrgyz: string; qa: string };
}
\`\`\`

### 3.3 Persistence and privacy

Persist language-neutral lesson/topic ids, phase/checkpoint, exercise variant seed, test index/answers, hint level, homework check state and completion; a language switch must not reset attempts. Validate/version persisted payloads; malformed fields are rejected or migrated explicitly. Local browser storage is prototype-only, not a durable classroom record. No child name, photo, precise location, free-form public profile or audio recording is required. Any future account/progress API requires guardian model, access control, retention/deletion and jurisdiction review.

### 3.4 AI/code generation pipeline

1. Parse JSON; schema-validate all 163 rows, track separation, unique ids and hour/week ranges. Fail loudly on missing source, voice, validator, controls, adaptive errors, animation or audio fields.
2. Generate a **draft artifact**, preserving source URL/status and raw spec; emit phase scene skeletons, metadata, typed validator TODO, assessment template (10+ distinct variants), homework template (5–8 different operations) and component/test checklist.
3. Treat \`spec.validator\` as explanatory text only. AI may propose an implementation but must output typed candidate code plus deterministic unit/property tests; never execute raw JSON expressions.
4. Generate variants with bounded seeded data; assert answer is in options, wrong answers are plausible but unambiguous, arithmetic and units are correct, and a second independent solve agrees.
5. Keep three grade-3 tracks separate. Do not merge 3 KG12 with 3 KG11. Preserve 4 KG11 and 5 KG12 integrated identity even if names overlap.
6. Require named human review decisions: Math → Pedagogy → Russian → Kyrgyz → Accessibility/QA. Only all recorded approvals may promote to \`approved\`; publication additionally requires release permission and provenance/license check. Generation never transitions a record to \`approved\`/ \`published\`.
7. Diff generated output to source version, retain generator version, input hash, variant seed, reviewer identity/date and test report.

## 4. Качество, локализация и выпуск

### 4.1 Review gate

| Gate | Обязательные доказательства | Блокирующее условие |
|---|---|---|
| Draft | provenance, целевой навык, A–D storyboard | Недостающие поля; неправильный трек; неподтверждённая дата/официальный статус |
| Math Review | Проверенные ответы/диапазоны/единицы, крайние случаи, reference решения | Любая неверная арифметика, неоднозначность, небезопасный evaluator |
| Pedagogy Review | Соответствие возрасту и prerequisite, concrete→pictorial→abstract, анализ misconception, нагрузка и перенос | Подсказка сразу раскрывает ответ; задача только на скорость; отсутствует новый transfer |
| RU Review | Вычитанный текст, короткие однозначные инструкции, глоссарий | Сложная/двусмысленная формулировка |
| KY Review | Вычитка носителем языка и редактором математики; проверка ң, ө, ү, терминов и аудио | Машинный/черновой перевод обозначен как готовый |
| Accessibility & QA | Keyboard, screen reader labels, touch, zoom, reduced motion, mute, error/fallback, regression | Drag без клавиатурной альтернативы; ошибка/звук без текстового эквивалента |
| Approved → Published | Все review gates, provenance/licensing, release owner и журнал версии | Любой \`pending\`, неразрешённая ошибка или отсутствие права распространения |

### 4.2 Приёмочные тесты продукта

1. В JSON ровно 163 уникальных паспорта; поля и суммы часов соответствуют таблице раздела 1.
2. Смена RU↔KY сохраняет topic id, фазу, ответ/номер попытки, прогресс; локализованный текст меняется, математика нет.
3. У каждого урока есть ровно A/B/C/D в порядке, пауза/повтор и ручной переход; не происходит автоматического перехода на просроченном таймере.
4. Не менее 10 разных задач независимой проверки и 5–8 домашних действий; домашняя работа связана с темой, содержит новый вариант и безопасный бытовой transfer.
5. Ошибки 1/2/3 вызывают разные уровни scaffolding и не раскрывают answer key раньше времени.
6. Тесты крайних случаев проверяют целые, знак, дроби/нулевой знаменатель, границы, эквивалентные формы, единицы, геометрию и нечисловой ввод, в зависимости от темы.
7. Pointer/touch и keyboard дают равнозначный результат; reduced-motion и mute полностью работают; focus остаётся предсказуемым.
8. Локальное сохранение переживает reload; повреждённые данные безопасно отклонены; никакой чужой профиль не доступен.
9. Все текстовые материалы помечены draft до всех проверок; ни один generator run не создаёт published content.
10. Тестировать на desktop/mobile, zoom, скринридере и low-end Android/iOS; измерять first-interaction KPI на реальной сети, не выдавать KPI за факт без замера.

## 5. Паспорта всех 163 тем

Для каждой темы ниже сведения из JSON разложены в единый исполнимый storyboard-контракт. Тексты реплик приводятся ровно как **черновик исходного паспорта**, а не утверждённая дикторская запись. Предложенное использование в A/B/C/D не доказывает методическую корректность; валидатор нужно реализовать типизированно и проверить, а не исполнять source string. У каждой темы индивидуальны цель, контекст, демонстрация, интерактив, модель ответа, тестовая идея, адаптивные ошибки, motion/audio keys, часы и provenance.
`;
}

function renderTopic(topic) {
  const spec = topic.spec;
  if (!Array.isArray(spec.voice) || spec.voice.length !== 4) {
    throw new Error(`Topic ${topic.id} must have exactly four voiceover draft lines.`);
  }

  const phaseRows = [
    {
      id: "A",
      screen: `Показать начальный сюжет/объект «${spec.context}», цель урока и один вопрос без ответа на экране.`,
      action: "Персонаж входит слева: opacity 0→1 + translateX(12px→0) за 250 ms; произносит вопрос/показывает субтитры; затем жестом обозначает проблему и ждёт действия «Начать». Не перекрывать интерактив; никакого авто-перехода.",
    },
    {
      id: "B",
      screen: spec.demo,
      action: "Пошагово показать предмет → пиктограмму/схему → запись; при реплике подсветить соответствующий объект/число, персонаж указывает на модель, но не закрывает её.",
    },
    {
      id: "C",
      screen: spec.task,
      action: "Предложить самостоятельное интерактивное действие; применить указанное управление и типизированный validator.",
    },
    {
      id: "D",
      screen: spec.test,
      action: "Предложить не менее 10 новых параметризованных вариантов по цели темы (2 понимание, 3 применение, 3 рассуждение/связь, 2 перенос); после порога показать мягкое резюме, однократные статичные/сокращённые звёзды и безопасное домашнее задание из 5–8 действий.",
    },
  ];
  const phases = phaseRows.map((phase, index) => `#### Фаза ${phase.id} — ${phaseNames[phase.id]} (${["0:00–0:30", "0:30–1:10", "1:10–1:50", "1:50–2:10+"][index]})

- **Экран/модель:** ${phase.screen}
- **Действие/триггер:** ${phase.action}
- **Черновик voiceover ${index + 1}/4:** > ${quote(spec.voice[index])}
`).join("\n");

  return `### ${topic.id} — ${topic.topic}

| Метаданные | Значение |
|---|---|
| Класс / трек | ${escapeCell(topic.grade)} / \`${escapeCell(topic.track)}\` |
| Предмет / учебный год | Математика / ${escapeCell(blueprint.academic_year)} |
| Позиция / модуль | ${topic.idx} / ${escapeCell(topic.module)} |
| Академические часы темы | ${topic.hours} (${topic.start_hour}–${topic.end_hour}) |
| Расчётные недели | ${topic.week_start}–${topic.week_end} — не календарные даты |
| Исходный статус / источник | ${escapeCell(topic.status)} / [Источник из Blueprint](${topic.source}) |
| Категория модели | \`${escapeCell(spec.category)}\` |
| Статус содержания | DRAFT — математика, методика, RU/KY и права требуют проверки |

**Фундаментальная дидактическая цель.** ${spec.goal}

**Контекст КР, указанный автором паспорта.** ${spec.context}. Это контекст визуализации, а не основание для обобщений о культуре/быте. Разрешено заменить декорацию нейтральной иллюстрацией без изменения учебного навыка или ответа.

#### Voiceover и возрастная метафора

- **Сценарная опора (из паспорта):** ${spec.voice.map((line) => quote(line)).join(" ")}
- **Возрастная подача:** короткие конкретные реплики; 1–2 класс — предмет/ситуация/действие; 3–5 — модель, сравнение способов и перенос в решение. Не вводить термин, не объяснив его на модели.
- **Ограничение локализации:** приведённые voice lines — проектный исходный русский текст. Кыргызская реплика/терминология не считается проверенной; поле KY обязано оставаться \`pending\` до редактора-носителя и математика.

#### Сцены и интерактивный flow

${phases}
#### Технический контракт конкретной механики

- **Управление/объекты:** ${spec.control}
- **Target/drag data:** каждой переносимой сущности присвоить стабильный id; \`draggable\` только если это действие прописано; связать с семантической \`target_zone\`; область ввода не меньше 44×44 px; \`snap_distance\` задаётся паспортом/сеткой, по умолчанию визуальная цель 12–18 px. Не считать hover/destination фактом правильности.
- **Проверка (исходная формула, НЕ исполняемый код):** \`${escapeCell(spec.validator)}\`
- **Правила результата:** сервер-/pure deterministic evaluator получает типизированные значения, валидирует finite/safe bounds, единицы и структуру модели; возвращает \`correct | incorrect | invalid-input\` и объяснение. Не принимать успех при пустом/NaN/Infinity/неполном состоянии и не использовать \`eval\`.
- **Состояния:** \`Initial → Intro(A) → Demonstration(B) → User_Interaction(C) → Validation_Success | Validation_Error → Scaffold_Level_1 → Scaffold_Level_2 → Guided_Resolution → Microtest(D) → Lesson_Complete → Homework\`. Разрешённая последовательность зависит от попыток; ошибки не блокируют повторное действие.
- **Варианты заданий:** отделить пример фазы B от assessment. Сгенерировать ≥10 заданий D с валидированными новыми значениями/ракурсами, по крайней мере один transfer, распределение понятий/ошибок по blueprint target. Все correct options должны быть достижимы; отвлекающие варианты отражают вероятные ошибки, но не допускают второй валидный ответ.
- **Сохранение:** записывать \`lessonId\`, track, language-neutral phase, exercise/seed, выбранный ответ, номер ошибки/hint level, тестовый индекс/ответы, домашние чекбоксы и completion. Переключение языка прогресс не стирает; при reload checkpoint восстанавливается и schema-version валидируется.

#### Адаптивная реакция на ошибки (исходный паспорт)

1. **Первая ошибка —** ${spec.error1}
2. **Повторная ошибка —** ${spec.error2}
3. **Третья и последующая —** ${spec.error3}

Технически: после неверной попытки не помечать сцену как failed, не показывать ответ сразу; дать текст и мягкий звуковой/визуальный сигнал. Следующая попытка проверяется тем же математическим правилом, а после совместного разбора предъявляется новый вариант. Заранее сохранять номер ошибки и hint level.

#### Animation & audio event map (source keys)

- **Исходное motion описание:** \`${escapeCell(spec.animation)}\`
- **Исходные audio asset keys:** \`${escapeCell(spec.audio)}\`
- **Минимальная карта вызовов:** \`scene_enter→fade_in\`; \`object_pick→scale_up\`; \`target_hover→pulse\`; \`drop_near→snap preview\`; \`answer_correct→snap+bounce\`; \`answer_incorrect→soft hint\`; \`lesson_complete→single particle_burst\`. Если контроллер/движение отсутствует в \`control\`, не симулировать лишний drag — оставить focus/select equivalent.
- **Reduced motion / mute:** отключать физику, bounce, непрерывный ambient и необязательные SFX независимо; сохранить текст, статический индикатор, состояние и все функции управления.

#### Рефлексия и домашняя работа

- **Независимая проверка (идея источника):** ${spec.test}
- **Порог/обратная связь:** создать 10 разных проверяемых вариантов; проектный стартовый порог — 8/10, подлежит педагогической пилотной валидации. При результате ниже порога дать разбор нужного шага, затем новый вариант; не показывать leaderboard.
- **Домашняя работа (6 заданий по общей рамке):** 2 распознавания модели; 2 новых самостоятельных действия; 1 объяснение «почему»; 1 перенос в безопасную бытовую ситуацию с объектом из темы/контекстом КР. Параметры не копируют числа из demonstration; при нужде добавить до 2 адаптивных заданий, максимум 8. Записывать выполнение локально; не требовать фото, аккаунта ребёнка или передачи персональных данных.
- **Время:** storyboard A–D — 2:10+ базового контента; практика, 10+ вопросов, повтор и домашняя работа дополняют его до планового среднего 20–25 минут, без тайм-лимита перехода.

**Критерий выпуска этого паспорта:** независимая проверка решения и крайних случаев; утверждённый prerequisite/уровень; подтверждённая формулировка на RU и KY; клавиатурная/сенсорная доступность; аудио/лицензии; прохождение unit, interaction, regression и accessibility QA. До всех отметок статус только \`draft\`.
`;
}

const docs = [];
docs.push(renderGlobalSpecification());

for (const expected of expectedTracks) {
  const topics = blueprint.topics
    .filter((topic) => topic.grade === expected.grade && topic.track === expected.track)
    .sort((left, right) => left.idx - right.idx);
  const gradeTitle = expected.grade === "3 кл. 11 лет"
    ? "3 КЛАСС — KG11_TRANSITION (11-летняя переходная траектория; отдельно от KG12)"
    : `${expected.grade.toLocaleUpperCase("ru-RU")} — ${expected.track}`;
  docs.push(`\n## ${gradeTitle}\n\n**Тем:** ${topics.length}. **Учебных часов:** ${expected.hours}. **Источник/статус:** как записано в соответствующем JSON-паспорте; недели расчётные.  
**Важно:** генерация сценарной заготовки не означает одобрение содержания. Каждый час многократной темы требует уникального варианта и отдельной проверки.
`);

  for (let index = 0; index < topics.length; index += 5) {
    const moduleTopics = topics.slice(index, index + 5);
    const first = moduleTopics[0].idx;
    const last = moduleTopics.at(-1).idx;
    docs.push(`\n### Модуль ${String(Math.floor(index / 5) + 1).padStart(2, "0")} — темы ${first}–${last}\n`);
    docs.push(moduleTopics.map(renderTopic).join("\n"));
  }
}

docs.push(`
## Приложение A. Source-of-truth и release checklist

- Source of truth для 163 записей: \`task/SANAK_Blueprint_163_topics.json\`; этот документ создаёт команда \`npm run generate:blueprint-spec\`.
- Исходная развернутая методическая версия: \`task/SANAK_Architectural_Educational_Blueprint_1-5.md\`. Обновлять JSON/версионировать отдельно; не исправлять арифметические/официальные статусы молча в экспортном документе.
- Сопоставить весь реестр: unique \`id\`, 4 голосовые строки, 14 spec полей, часы/недели и все 6 expected track-count invariants.
- До рендеринга/печати сохранить заголовки, URL provenance, математические символы, номера тем/часов и границы трека; не разбивать строку таблицы/фрагмент формулы по смыслу.
- Рекомендуемая PDF-компоновка: A4, поля 18–22 мм, шрифт с кириллицей и ң/ө/ү; титульная страница и оглавление, заголовок темы без отрыва от таблицы, повтор шапки длинных таблиц, активные URL; не уменьшать основной шрифт ниже читаемого размера ради краткости.
- Версия PDF должна содержать дату/версию, watermark/status «ПРОЕКТ — НЕ УТВЕРЖДЕНО», ссылку на source snapshot и hash JSON; проверить визуальный экспорт страниц перед распространением.

## Приложение B. Термины статуса

**Source curriculum data** — идентификатор темы, часы/последовательность и исходный provenance; источник/доступность/права проверяются отдельно.  
**Design proposal** — сценарий, метафора, упражнения, текст, validator, модель, interaction и motion/audio решения этого blueprint.  
**Reviewed lesson** — отдельная версионированная реализация с evidence и подписью ревьюеров.  
**Published lesson** — Reviewed lesson, прошедший release/license/accessibility gates.  
JSON и этот документ не подтверждают, что какой-либо из 163 проектных уроков прошёл эти стадии.
`);

const output = `${docs.join("\n")}\n`;
const renderedPassports = output.split("\n").filter((line) => line.startsWith("### KG-"));
if (renderedPassports.length !== passportIds.size) {
  throw new Error(`Expected ${passportIds.size} rendered passports; found ${renderedPassports.length}.`);
}
for (const phase of ["A", "B", "C", "D"]) {
  const renderedPhaseCount = output.split("\n").filter((line) => line.startsWith(`#### Фаза ${phase} — `)).length;
  if (renderedPhaseCount !== passportIds.size) {
    throw new Error(`Phase ${phase} must appear once in every passport; found ${renderedPhaseCount}.`);
  }
}
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, "utf8");
console.log(`Generated ${expectedTracks.reduce((sum, track) => sum + track.count, 0)} topic passports at ${outputPath} (${output.length.toLocaleString("en-US")} characters).`);
