import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const source = JSON.parse((await readFile(new URL('../task/How to code the Lessons.json', import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
const root = new URL('../content/authored-lessons/', import.meta.url);
await mkdir(root, { recursive: true });
function task(item) {
  return {
    id: item.task_id ?? item.step_id,
    title: item.child_title,
    text: item.child_text,
    instruction: item.child_instruction,
    interaction: item.interaction_type,
    objects: item.scene.objects.map(({ object_id, state, zone, accessibility_label }) => ({ id: object_id, state, zone, label: accessibility_label })),
    rule: item.validation.rule,
    explanation: item.explanation,
    feedback: item.feedback,
    hints: item.hints,
  };
}

const transientStateKeys = new Set(['counted', 'in_basket', 'painted', 'selected']);
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'id' && !transientStateKeys.has(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}
function promptFor(item) {
  return item.instruction
    .trim()
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(' ')
    .toLocaleLowerCase('ru-RU');
}
function semanticObject(object) {
  return {
    zone: object.zone,
    label: object.label.trim().replace(/\s+\d+$/, '').toLocaleLowerCase('ru-RU'),
    state: canonicalize(object.state),
  };
}
function signatureFor(item) {
  const objectsById = new Map(item.objects.map((object) => [object.id, semanticObject(object)]));
  const reference = (id) => objectsById.get(id) ?? null;
  const rule = Object.fromEntries(
    Object.entries(item.rule)
      .filter(([key]) => key !== 'id' && key !== 'state_field')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => {
        if (Array.isArray(value) && /_ids$/.test(key)) {
          const references = value.map((id) => typeof id === 'string' ? reference(id) : canonicalize(id));
          return [key, references.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))];
        }
        if (typeof value === 'string' && /_id$/.test(key)) return [key, reference(value)];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          const entries = Object.entries(value).map(([id, nested]) => [reference(id), canonicalize(nested)]);
          return [key, entries.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))];
        }
        return [key, canonicalize(value)];
      }),
  );
  return JSON.stringify({
    prompt: promptFor(item),
    objects: item.objects
      .map(semanticObject)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    rule,
  });
}
function distinctAssessment(items) {
  const seen = new Set();
  return items.filter((item) => {
    const signature = signatureFor(item);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  }).slice(0, 10);
}

const index = [];
const authoredContent = new Map();
for (const lesson of source.lessons) {
  const { metadata: meta } = lesson;
  if (lesson.final_assessment.tasks.length !== 10) throw new Error(`Expected ten tasks: ${meta.lesson_id}`);
  const content = {
    id: meta.lesson_id, courseId: source.course_id, title: meta.title, order: meta.course_order,
    blockId: meta.curriculum_block_id, sourceTopic: meta.original_ktp_topic_number,
    topic: meta.topic, duration: meta.estimated_duration_minutes,
    objectives: lesson.learning_objectives.map((item) => item.description),
    explanation: lesson.child_explanation.full_text,
    steps: lesson.lesson_steps.map(task), practice: lesson.guided_practice.map(task),
    assessment: lesson.final_assessment.tasks.map(task), threshold: lesson.final_assessment.scoring.mastery_threshold,
    homework: lesson.homework.tasks.map((item) => item.type === 'offline_practical' ? { id: item.homework_task_id, instruction: item.child_instruction, parentNote: item.parent_note, offline: true } : task(item)),
    parentNote: lesson.homework.parent_note, print: lesson.homework.pdf_spec,
    summary: lesson.completion.child_summary, reflection: lesson.completion.self_reflection,
    nextId: lesson.completion.next_lesson_id,
    video: { src: null, captions: null },
  };
  const hash = createHash('sha256').update(JSON.stringify(content)).digest('hex');
  await writeFile(new URL(`${meta.lesson_id}.json`, root), JSON.stringify({ ...content, contentHash: hash }));
  authoredContent.set(content.id, content);
  index.push({ id: content.id, title: content.title, order: content.order, blockId: content.blockId, sourceTopic: content.sourceTopic, topic: content.topic, duration: content.duration });
}
const ruleDifficulty = {
  unique_count_equal: 1, selected_ids_equal: 1, ordered_values_equal: 2, classification_equal: 2,
  cover_integer_interval: 3, angle_modulo_equal: 2, cell_equal: 2, tick_equal: 1, value_equal: 1, trace_coverage: 1,
};
const lessonsByTopic = new Map();
for (const entry of index) {
  const lesson = authoredContent.get(entry.id);
  const assessment = distinctAssessment(lesson.assessment);
  const ruleTypes = [...new Set(assessment.map((item) => item.rule.rule_type))];
  const interactions = new Set(assessment.map((item) => item.interaction));
  entry.difficulty = assessment.length + interactions.size + ruleTypes.reduce((sum, rule) => sum + (ruleDifficulty[rule] ?? 1), 0);
  const group = lessonsByTopic.get(entry.sourceTopic) ?? [];
  group.push(entry);
  lessonsByTopic.set(entry.sourceTopic, group);
}
for (const lessons of lessonsByTopic.values()) {
  const totalDifficulty = lessons.reduce((sum, lesson) => sum + lesson.difficulty, 0);
  let awarded = 0;
  const shares = lessons.map((lesson) => {
    const exactPoints = 100 * lesson.difficulty / totalDifficulty;
    lesson.points = Math.floor(exactPoints);
    awarded += lesson.points;
    return { lesson, remainder: exactPoints - lesson.points };
  });
  shares.sort((left, right) => right.remainder - left.remainder || left.lesson.order - right.lesson.order);
  for (let i = 0; i < 100 - awarded; i++) shares[i].lesson.points++;
}
await writeFile(new URL('index.json', root), JSON.stringify({ courseId: source.course_id, lessons: index }, null, 2));
console.log(`Prepared ${index.length} authored lessons, ${index.length * 10} assessment tasks, and 100 reward points per topic. Videos left for the owner.`);
