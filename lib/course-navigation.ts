import index from "@/content/authored-lessons/index.json";
import { expandLessonSlots, type LessonSlot } from "@/lib/curriculum";

export function activeLessonSlots(grade: 1 | 2): LessonSlot[] {
  if (grade === 2) return expandLessonSlots(2);
  const legacy = expandLessonSlots(1);
  return index.lessons.map((lesson) => {
    const block = index.lessons.filter((item) => item.blockId === lesson.blockId);
    const part = block.findIndex((item) => item.id === lesson.id) + 1;
    const source = legacy.find((slot) => slot.topic.sourceOrder === lesson.sourceTopic && slot.part === part)!;
    return { ...source, id: lesson.id, globalHour: lesson.order, topic: { ...source.topic, titleRu: lesson.title, titleKy: lesson.title } };
  });
}
export function lessonHref(slot: LessonSlot) {
  return slot.id.startsWith("g1_l") ? `/course/grade-1/${slot.id}` : `/lesson/${slot.grade}/${slot.topic.sourceOrder}/${slot.part}`;
}
