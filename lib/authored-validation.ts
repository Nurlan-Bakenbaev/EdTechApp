import type { AuthoredTask, TaskWork } from "@/lib/authored-types";
export type TaskResult = "correct" | "incorrect" | "incomplete";
const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((value, index) => value === b[index]);
const integer = (value: unknown) => typeof value === "number" ? Number.isSafeInteger(value) : typeof value === "string" && /^-?\d+$/.test(value.trim());

export function validateAuthoredTask(task: AuthoredTask, work: TaskWork): TaskResult {
  if (!work.submitted) return "incomplete";
  const rule = task.rule;
  const ids = work.ids ?? [];
  const unique = [...new Set(ids)];
  if (unique.length !== ids.length) return "incorrect";
  let correct = false;
  switch (rule.rule_type) {
    case "unique_count_equal":
      correct = unique.every((id) => rule.allowed_ids.includes(id)) && unique.length === rule.expected_count;
      break;
    case "selected_ids_equal":
      if (!ids.length && rule.expected_ids.length) return "incomplete";
      correct = ids.every((id) => rule.object_ids.includes(id)) && same([...ids].sort(), [...rule.expected_ids].sort());
      break;
    case "ordered_values_equal":
      if (ids.length < rule.object_ids.length) return "incomplete";
      correct = same([...ids].sort(), [...rule.object_ids].sort()) && same(ids.map((id) => task.objects.find((object) => object.id === id)?.state.value), rule.expected_values);
      break;
    case "classification_equal": {
      const categories = work.categories ?? {};
      const expected = Object.keys(rule.expected_categories);
      if (Object.keys(categories).some((id) => !expected.includes(id))) return "incorrect";
      if (!rule.unpainted_means_no && expected.some((id) => !categories[id])) return "incomplete";
      correct = expected.every((id) => (categories[id] ?? "no") === rule.expected_categories[id]);
      break;
    }
    case "cover_integer_interval": {
      const placements = work.placements ?? {};
      if (Object.keys(placements).some((id) => !(id in rule.piece_lengths))) return "incorrect";
      if (Object.keys(rule.piece_lengths).some((id) => placements[id] === undefined)) return "incomplete";
      const cells: number[] = [];
      for (const [id, length] of Object.entries(rule.piece_lengths)) {
        const start = placements[id];
        if (!Number.isSafeInteger(start)) return "incorrect";
        for (let index = 0; index < length; index++) cells.push(start + index);
      }
      correct = same(cells.sort((a, b) => a - b), Array.from({ length: rule.end - rule.start }, (_, index) => rule.start + index));
      break;
    }
    case "cell_equal":
      if (work.placements?.[rule.object_id] === undefined) return "incomplete";
      correct = Object.keys(work.placements).length === 1 && work.placements[rule.object_id] === rule.expected_cell;
      break;
    case "tick_equal":
      if (work.value === undefined || work.value === "") return "incomplete";
      correct = integer(work.value) && Number(work.value) === rule.expected_tick;
      break;
    case "angle_modulo_equal":
      if (work.value === undefined) return "incomplete";
      correct = integer(work.value) && ((Number(work.value) % 360) + 360) % 360 === ((rule.expected_degrees % 360) + 360) % 360;
      break;
    case "trace_coverage":
    case "value_equal": {
      if (work.value === undefined || work.value === "") return "incomplete";
      const expected = rule.rule_type === "trace_coverage" ? rule.fallback_rule.expected_value : rule.expected_value;
      correct = typeof expected === "number" ? integer(work.value) && Number(work.value) === expected : work.value === expected;
      break;
    }
  }
  return correct ? "correct" : "incorrect";
}
