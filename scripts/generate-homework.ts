import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureHomeworkPdf } from "../lib/homework-pdf";
import type { AuthoredLesson } from "../lib/authored-types";

async function main() {
  const index = JSON.parse(await readFile("content/authored-lessons/index.json", "utf8")) as { lessons: { id: string }[] };
  const manifests = [];
  for (const { id } of index.lessons) {
    const lesson = JSON.parse(await readFile(path.join("content", "authored-lessons", `${id}.json`), "utf8")) as AuthoredLesson;
    manifests.push(await ensureHomeworkPdf(lesson));
  }
  await writeFile("HomeWorks/manifest.json", JSON.stringify(manifests, null, 2));
  console.log(`Ready: ${manifests.length} student PDFs and ${manifests.length} separate answer keys.`);
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
