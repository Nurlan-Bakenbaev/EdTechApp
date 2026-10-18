export interface MathModel { renderer?: string; [key: string]: unknown }
export interface SceneObject { id: string; state: MathModel; zone: string; label: string }
export type ValidationRule =
  | { rule_type: "unique_count_equal"; expected_count: number; allowed_ids: string[]; state_field: string }
  | { rule_type: "selected_ids_equal"; expected_ids: string[]; object_ids: string[] }
  | { rule_type: "ordered_values_equal"; expected_values: (number | string)[]; object_ids: string[] }
  | { rule_type: "classification_equal"; expected_categories: Record<string, string>; unpainted_means_no: boolean }
  | { rule_type: "cover_integer_interval"; start: number; end: number; piece_lengths: Record<string, number> }
  | { rule_type: "angle_modulo_equal"; expected_degrees: number }
  | { rule_type: "cell_equal"; expected_cell: number; object_id: string }
  | { rule_type: "tick_equal"; expected_tick: number }
  | { rule_type: "value_equal"; expected_value: number | string }
  | { rule_type: "trace_coverage"; fallback_rule: { rule_type: "value_equal"; expected_value: number } };
export interface AuthoredTask {
  id: string; title?: string; text?: string; instruction: string; interaction: string;
  objects: SceneObject[]; rule: ValidationRule; explanation: string;
  feedback: { correct: string; incorrect: string; incomplete: string };
  hints: { level: number; text: string; show_only_after_attempt?: boolean }[];
}
export interface TaskWork {
  ids?: string[]; categories?: Record<string, string>; placements?: Record<string, number>;
  value?: string | number; submitted?: boolean;
}
export interface Attempt {
  id: string; correct: boolean; hints: number; assisted: boolean; work: TaskWork;
}
export interface TaskProgress { work: TaskWork; hints: number; first?: Attempt; latest?: Attempt }
export interface AuthoredProgress {
  tab: "lesson" | "test" | "homework"; taskIndex: number;
  tasks: Record<string, TaskProgress>; steps: string[]; homeworkDone: string[];
  adultConfirmed: boolean; reflection?: string; videoPosition: number; videoSeen: boolean;
}
export interface PrintTask { print_task_id: string; instruction: string; models: MathModel[]; response_format: string; answer_space_mm: number; answer: unknown; explanation: string }
export interface AuthoredLesson {
  id: string; courseId: string; contentHash: string; title: string; order: number; blockId: string;
  sourceTopic: number; topic: string; duration: number; objectives: string[]; explanation: string;
  steps: AuthoredTask[]; practice: AuthoredTask[]; assessment: AuthoredTask[];
  threshold: number; homework: (AuthoredTask | { id: string; instruction: string; parentNote: string; offline: true })[];
  parentNote: string; print: { tasks: PrintTask[] }; summary: string;
  reflection: { question: string; options: string[] }; nextId: string | null;
  video: { src: string | null; captions: string | null };
}
