import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const auditPath = path.join(process.cwd(), "docs", "SOURCE_AUDIT.md");
  const content = await readFile(auditPath, "utf8");
  return new Response(content, {
    headers: {
      "Content-Disposition": 'attachment; filename="BILIM_SOURCE_AUDIT.md"',
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
