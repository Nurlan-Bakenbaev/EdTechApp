import { notFound } from "next/navigation";
import { LessonPage } from "@/components/lesson-page";
import { getLessonSlot } from "@/lib/curriculum";

export default async function Page({ params }: { params: Promise<{ grade: string; topic: string; part: string }> }) {
  const values = await params;
  const grade = Number(values.grade);
  const topic = Number(values.topic);
  const part = Number(values.part);
  const slot = getLessonSlot(grade, topic, part);
  if (!slot) notFound();
  return <LessonPage slot={slot} />;
}
