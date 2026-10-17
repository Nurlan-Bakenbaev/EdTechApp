import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(root, "task", "SANAK_Blueprint_163_topics.json");
const outputPath = resolve(root, "content", "lesson-drafts.json");
const blueprint = JSON.parse(await readFile(inputPath, "utf8"));

if (!Array.isArray(blueprint.topics) || blueprint.topics.length !== 163) {
  throw new Error(`Expected 163 topic passports in ${inputPath}.`);
}

const phases = [
  { id: "A", targetSeconds: 120, sourceVoiceIndex: 0 },
  { id: "B", targetSeconds: 240, sourceVoiceIndex: 1 },
  { id: "C", targetSeconds: 360, sourceVoiceIndex: 2 },
  { id: "D", targetSeconds: 480, sourceVoiceIndex: 3 },
];

const drafts = blueprint.topics.map((topic) => {
  const required = ["id", "grade", "track", "idx", "hours", "source", "week_start", "week_end"];
  const missing = required.filter((key) => topic[key] === undefined || topic[key] === null);
  if (missing.length > 0 || !topic.spec || !Array.isArray(topic.spec.voice) || topic.spec.voice.length !== 4) {
    throw new Error(`Topic ${topic.id ?? "(unknown)"} is missing required Blueprint fields: ${missing.join(", ")}.`);
  }

  return {
    id: topic.id,
    status: "draft",
    publishable: false,
    source: {
      blueprint: "SANAK Architectural & Educational Blueprint v1.0",
      sourceUrl: topic.source,
      sourceStatus: topic.status,
      academicYear: blueprint.academic_year,
      track: topic.track,
      grade: topic.grade,
      topicIndex: topic.idx,
      hours: topic.hours,
      weekStart: topic.week_start,
      weekEnd: topic.week_end,
      title: topic.topic,
    },
    objective: topic.spec.goal,
    context: topic.spec.context,
    scenes: phases.map((phase) => ({
      id: phase.id,
      targetSeconds: phase.targetSeconds,
      narration: { ru: topic.spec.voice[phase.sourceVoiceIndex], ky: null },
      visualOrAction: phase.id === "A"
        ? topic.spec.context
        : phase.id === "B"
          ? topic.spec.demo
          : phase.id === "C"
            ? topic.spec.task
            : topic.spec.test,
    })),
    validator: {
      sourceExpression: topic.spec.validator,
      executable: false,
    },
    adaptiveGuidance: {
      firstError: topic.spec.error1,
      secondError: topic.spec.error2,
      thirdError: topic.spec.error3,
    },
    homeworkTemplate: {
      activityTypes: ["recognition", "new-model", "explain", "transfer"],
      suggestedExerciseCount: 6,
      authoredTasks: [],
    },
    review: {
      math: "pending",
      pedagogy: "pending",
      russian: "pending",
      kyrgyz: "pending",
      accessibilityAndQa: "pending",
    },
  };
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  generatedFrom: "task/SANAK_Blueprint_163_topics.json",
  generatorVersion: 1,
  policy: "Blueprint-derived scaffolds are editorial drafts and cannot be published without every review.",
  drafts,
}, null, 2)}\n`, "utf8");
console.log(`Generated ${drafts.length} non-publishable lesson drafts at ${outputPath}.`);
