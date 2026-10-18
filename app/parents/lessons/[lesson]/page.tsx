import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthoredLesson } from "@/lib/authored-lessons";

export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  const lesson = await getAuthoredLesson(id);
  if (!lesson) notFound();
  return <div className="page-surface authored-course" lang="ru"><div className="shell"><header className="authored-header"><Link href={`/course/grade-1/${lesson.id}`}>← К уроку</Link><h1>Для родителей</h1><p>{lesson.title}</p></header><div className="authored-content"><p>{lesson.parentNote}</p>{lesson.print.tasks.map((task, index) => <section className="authored-task" key={task.print_task_id}><h2>Задание {index + 1}</h2><p>{task.instruction}</p><p><strong>Ответ: </strong>{task.answer === null ? "Практическое задание" : typeof task.answer === "object" ? JSON.stringify(task.answer) : String(task.answer)}</p><p>{task.explanation}</p></section>)}</div></div></div>;
}
