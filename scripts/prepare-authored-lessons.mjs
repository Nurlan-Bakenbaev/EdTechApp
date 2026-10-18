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
const index = [];
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
  index.push({ id: content.id, title: content.title, order: content.order, blockId: content.blockId, sourceTopic: content.sourceTopic, topic: content.topic, duration: content.duration });
}
await writeFile(new URL('index.json', root), JSON.stringify({ courseId: source.course_id, lessons: index }, null, 2));
console.log(`Prepared ${index.length} authored lessons, ${index.length * 10} assessment tasks. Videos left for the owner.`);
