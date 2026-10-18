import { notFound } from "next/navigation";
import { getAuthoredLesson } from "@/lib/authored-lessons";
import { AuthoredLessonPage } from "@/components/authored-lesson";

export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  const lesson = await getAuthoredLesson(id);
  if (!lesson) notFound();
  return <AuthoredLessonPage key={lesson.id} lesson={lesson} />;
}
