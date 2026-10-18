import type { AuthoredTask, SceneObject } from "@/lib/authored-types";

const transientStateKeys = new Set(["counted", "in_basket", "painted", "selected"]);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "id" && !transientStateKeys.has(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function promptFor(task: AuthoredTask): string {
  return task.instruction
    .trim()
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .toLocaleLowerCase("ru-RU");
}

function semanticObject(object: SceneObject): unknown {
  return {
    zone: object.zone,
    label: object.label.trim().replace(/\s+\d+$/, "").toLocaleLowerCase("ru-RU"),
    state: canonicalize(object.state),
  };
}

function signatureFor(task: AuthoredTask): string {
  const objectsById = new Map(task.objects.map((object) => [object.id, semanticObject(object)]));
  const reference = (id: string) => objectsById.get(id) ?? null;
  const rule = Object.fromEntries(
    Object.entries(task.rule)
      .filter(([key]) => key !== "id" && key !== "state_field")
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => {
        if (Array.isArray(value) && /_ids$/.test(key)) {
          const references = value.map((id) => typeof id === "string" ? reference(id) : canonicalize(id));
          return [key, references.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))];
        }
        if (typeof value === "string" && /_id$/.test(key)) return [key, reference(value)];
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          const entries = Object.entries(value).map(([id, nested]) => [reference(id), canonicalize(nested)]);
          return [key, entries.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))];
        }
        return [key, canonicalize(value)];
      }),
  );
  return JSON.stringify({
    prompt: promptFor(task),
    objects: task.objects
      .map(semanticObject)
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    rule,
  });
}

export function uniqueAssessmentTasks(tasks: AuthoredTask[]): AuthoredTask[] {
  const seen = new Set<string>();
  const unique: AuthoredTask[] = [];

  for (const task of tasks) {
    const signature = signatureFor(task);
    if (seen.has(signature)) continue;
    seen.add(signature);
    unique.push(task);
    if (unique.length === 10) break;
  }

  return unique;
}
