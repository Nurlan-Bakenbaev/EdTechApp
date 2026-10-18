import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAuthoredLesson } from "@/lib/authored-lessons";
import { ensureHomeworkPdf } from "@/lib/homework-pdf";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: id } = await params;
  const lesson = await getAuthoredLesson(id);
  if (!lesson) return new Response("Урок не найден", { status: 404 });
  try {
    const manifest = await ensureHomeworkPdf(lesson);
    const data = await readFile(path.join(process.cwd(), manifest.student_pdf_path));
    const disposition = new URL(request.url).searchParams.has("download") ? "attachment" : "inline";
    return new Response(new Uint8Array(data), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename="${lesson.id}_homework.pdf"`, "Cache-Control": "private, max-age=0, must-revalidate" } });
  } catch {
    return new Response("Лист готовится. Домашние задания доступны во вкладке Д/З. Попробуйте ещё раз.", { status: 503, headers: { "Retry-After": "5" } });
  }
}
