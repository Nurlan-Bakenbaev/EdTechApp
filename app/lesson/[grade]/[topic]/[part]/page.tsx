import { notFound, redirect } from "next/navigation";
import { LessonPage } from "@/components/lesson-page";
import { getLessonSlot } from "@/lib/curriculum";
import index from "@/content/authored-lessons/index.json";

export default async function Page({ params }: { params: Promise<{ grade: string; topic: string; part: string }> }) {
  const values = await params;
  const grade = Number(values.grade);
  const topic = Number(values.topic);
  const part = Number(values.part);
  if (grade === 1) {
    const authored = index.lessons.filter((lesson) => lesson.sourceTopic === topic)[part - 1];
    if (authored) redirect(`/course/grade-1/${authored.id}`);
    if (topic >= 1 && topic <= 3) redirect("/grades/1");
  }
  const slot = getLessonSlot(grade, topic, part);
  if (!slot) notFound();
  return <LessonPage key={slot.id} slot={slot} />;
}
