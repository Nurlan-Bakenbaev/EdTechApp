import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { modelSvg } from "./math-model-svg";
import type { AuthoredLesson } from "./authored-types";

export interface HomeworkManifest { lesson_id: string; content_hash: string; student_pdf_path: string; teacher_answer_key_path: string; status: "ready"; generated_at: string; page_count: number }
const jobs = new Map<string, Promise<HomeworkManifest>>();
const root = path.join(process.cwd(), "HomeWorks");

async function renderPdf(lesson: AuthoredLesson, answers: boolean): Promise<{ buffer: Buffer; pages: number }> {
  const doc = new PDFDocument({ size: "A4", margin: 43, bufferPages: true, info: { Title: `${lesson.title}${answers ? " — ответы" : " — домашнее задание"}`, Author: "BILIM" } });
  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("data", (chunk: Buffer) => chunks.push(chunk)); doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const font = path.join(process.cwd(), "assets", "fonts", "NotoSans-Regular.ttf");
  doc.registerFont("NotoSans", font).font("NotoSans");
  const width = doc.page.width - 86;
  doc.fontSize(14).text(`BILIM · 1 класс · Урок ${lesson.order}`);
  doc.moveDown(0.6).fontSize(21).text(lesson.title);
  doc.moveDown(0.6).fontSize(14).text(answers ? "Для родителей: ответы и пояснения" : "Имя: ____________________   Дата: __________");
  doc.moveDown();
  for (const [index, task] of lesson.print.tasks.entries()) {
    const models = task.models.map((model) => modelSvg(model));
    const modelHeights = models.map(({ width: modelWidth, height }) => height * Math.min(0.8, width / modelWidth));
    const question = `${index + 1}. ${task.instruction}`;
    const body = answers ? `Ответ: ${task.answer === null ? "Практическое задание со взрослым" : typeof task.answer === "object" ? JSON.stringify(task.answer) : String(task.answer)}\n${task.explanation}` : task.response_format;
    const estimated = doc.fontSize(14).heightOfString(question, { width }) + doc.heightOfString(body, { width }) + (answers ? 0 : modelHeights.reduce((a, b) => a + b, 0) + task.answer_space_mm * 2.835) + 40;
    if (doc.y + estimated > doc.page.height - 43) doc.addPage();
    doc.fontSize(14).fillColor("#111111").text(question, { width }); doc.moveDown(0.5);
    if (!answers) for (const [modelIndex, model] of models.entries()) {
      const scale = Math.min(0.8, width / model.width);
      const top = doc.y;
      SVGtoPDF(doc, model.svg, 43, top, { width: model.width * scale, height: modelHeights[modelIndex], fontCallback: () => "NotoSans" });
      doc.y = top + modelHeights[modelIndex] + 10;
    }
    doc.fontSize(14).text(body, 43, doc.y, { width });
    if (!answers) {
      const top = doc.y + 12, space = task.answer_space_mm * 2.835;
      doc.strokeColor("#999999").lineWidth(0.5).rect(43, top, width, space).stroke();
      doc.y = top + space + 20;
    } else doc.moveDown(1.2);
  }
  const pages = doc.bufferedPageRange().count;
  for (let page = 0; page < pages; page++) {
    doc.switchToPage(page);
    doc.fontSize(10).fillColor("#555555").text(`${lesson.id} · ${page + 1}/${pages} · Печать 100%`, 43, doc.page.height - 30, { width, lineBreak: false });
  }
  doc.end();
  return { buffer: await finished, pages };
}

async function generate(lesson: AuthoredLesson): Promise<HomeworkManifest> {
  await mkdir(path.join(root, "TeacherKeys"), { recursive: true });
  const manifestPath = path.join(root, `${lesson.id}.manifest.json`);
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as HomeworkManifest;
    if (manifest.status === "ready" && manifest.content_hash === lesson.contentHash) {
      await Promise.all([readFile(path.join(process.cwd(), manifest.student_pdf_path)), readFile(path.join(process.cwd(), manifest.teacher_answer_key_path))]);
      return manifest;
    }
  } catch { /* Missing or stale artifacts are regenerated from the source content. */ }
  const student = await renderPdf(lesson, false), teacher = await renderPdf(lesson, true);
  const studentPath = `HomeWorks/${lesson.id}_homework.pdf`, teacherPath = `HomeWorks/TeacherKeys/${lesson.id}_answers.pdf`;
  for (const [relative, document] of [[studentPath, student], [teacherPath, teacher]] as const) {
    if (document.buffer.subarray(0, 5).toString() !== "%PDF-" || document.pages < 1) throw new Error("PDF validation failed");
    const target = path.join(process.cwd(), relative), temp = `${target}.${process.pid}.tmp`;
    await writeFile(temp, document.buffer); await rename(temp, target);
  }
  const manifest: HomeworkManifest = { lesson_id: lesson.id, content_hash: lesson.contentHash, student_pdf_path: studentPath, teacher_answer_key_path: teacherPath, status: "ready", generated_at: new Date().toISOString(), page_count: student.pages };
  await writeFile(`${manifestPath}.tmp`, JSON.stringify(manifest, null, 2)); await rename(`${manifestPath}.tmp`, manifestPath);
  return manifest;
}

export function ensureHomeworkPdf(lesson: AuthoredLesson) {
  const key = `${lesson.id}:${lesson.contentHash}`;
  const current = jobs.get(key);
  if (current) return current;
  const job = generate(lesson).finally(() => jobs.delete(key));
  jobs.set(key, job); return job;
}
