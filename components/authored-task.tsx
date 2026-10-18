"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MathModelView } from "@/components/math-model";
import { validateAuthoredTask } from "@/lib/authored-validation";
import type { AuthoredTask, TaskProgress, TaskWork } from "@/lib/authored-types";
import { lessonFruitForId, replaceCounterNouns } from "@/lib/lesson-fruit";
import { lessonMascotForId } from "@/lib/lesson-mascot";

export function SpeakButton({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setSupported("speechSynthesis" in window), 0); return () => { clearTimeout(timer); window.speechSynthesis?.cancel(); }; }, []);
  return supported ? <button type="button" className="hint-button" onClick={() => { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(text); speech.lang = "ru-RU"; speech.rate = 0.85; window.speechSynthesis.speak(speech); }}>♪ Послушать</button> : null;
}

export function AuthoredTaskView({ task, progress, onChange }: { task: AuthoredTask; progress: TaskProgress; onChange: (progress: TaskProgress) => void }) {
  const [status, setStatus] = useState<"correct" | "incorrect" | "incomplete" | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const work = progress.work;
  const ids = work.ids ?? [];
  const rule = task.rule;
  const answers = task.objects.filter((object) => object.zone === "answer");
  const models = task.objects.filter((object) => object.zone === "demonstration" && object.state.renderer);
  const draggable = /drag|sort_answer|make_quantity|snap_parts/.test(task.interaction);
  const fruit = lessonFruitForId(task.id);
  const mascot = lessonMascotForId(task.id);
  const usesFruitCounters = models.some((object) => object.state.renderer === "countable_objects" || object.state.renderer === "group_cards" || object.state.renderer === "operation_scene");
  const presentText = (value: string) => usesFruitCounters ? replaceCounterNouns(value, fruit) : value;

  function update(next: TaskWork) { onChange({ ...progress, work: { ...next, submitted: false } }); setStatus(null); }
  function toggle(id: string) {
    if (rule.rule_type === "selected_ids_equal") update({ ...work, ids: ids.includes(id) ? [] : [id] });
    else update({ ...work, ids: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id] });
  }
  function submit() {
    const submitted = { ...work, submitted: true };
    if (rule.rule_type === "angle_modulo_equal" && submitted.value === undefined) submitted.value = Number(models[0]?.state.start_angle ?? 0);
    const result = validateAuthoredTask(task, submitted);
    setStatus(result);
    if (result === "incomplete") return;
    const attempt = { id: crypto.randomUUID(), correct: result === "correct", hints: progress.hints, assisted: progress.hints > 0, work: submitted };
    onChange({ ...progress, work: submitted, first: progress.first ?? attempt, latest: attempt });
  }
  const maxHints = progress.first ? task.hints.length : task.hints.filter((hint) => !hint.show_only_after_attempt).length;

  return <section className="authored-task">
    <div className="authored-task-heading"><h3>{presentText(task.instruction)}</h3><SpeakButton text={presentText(task.instruction)} /></div>
    <div className="authored-models">{models.filter((object) => !(rule.rule_type === "ordered_values_equal" && object.state.renderer === "number_cards")).map((object) => <MathModelView key={object.id} model={rule.rule_type === "angle_modulo_equal" ? { ...object.state, start_angle: Number(work.value ?? object.state.start_angle ?? 0) } : object.state} label={presentText(object.label)} fruit={fruit} />)}</div>
    {(rule.rule_type === "unique_count_equal" || rule.rule_type === "selected_ids_equal" || rule.rule_type === "ordered_values_equal") && <>
      <p className="authored-instruction">{rule.rule_type === "ordered_values_equal" ? "Нажимай на карточки в нужном порядке. Повторное нажатие убирает карточку." : draggable ? "Перетащи предмет в поле ответа. Или выбери предмет и нажми «Добавить»." : "Нажимай на предметы, чтобы выбрать их. Можно отменить выбор повторным нажатием."}</p>
      <div className="authored-options">{answers.filter((object) => rule.rule_type !== "unique_count_equal" || rule.allowed_ids.includes(object.id)).map((object) => <button type="button" key={object.id} aria-label={presentText(object.label)} aria-pressed={ids.includes(object.id)} className={`authored-object ${ids.includes(object.id) ? "selected" : ""} ${picked === object.id ? "picked" : ""}`} draggable={draggable} onDragStart={(event) => { event.dataTransfer.setData("text/plain", object.id); }} onClick={() => draggable && !ids.includes(object.id) ? setPicked(object.id) : toggle(object.id)}>{object.state.renderer ? <MathModelView model={object.state} label={presentText(object.label)} fruit={fruit} /> : usesFruitCounters && rule.rule_type === "unique_count_equal" ? <Image className="authored-fruit-item" src={`/assets/lesson-objects/${fruit}.svg`} alt="" width={42} height={42} sizes="42px" aria-hidden="true" /> : object.state.value !== undefined ? String(object.state.value) : "●"}{ids.includes(object.id) && <span className="object-check">{rule.rule_type === "ordered_values_equal" ? ids.indexOf(object.id) + 1 : "✓"}</span>}</button>)}</div>
      {draggable && <button type="button" className="lesson-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); if (answers.some((object) => object.id === id) && !ids.includes(id)) toggle(id); setPicked(null); }} onClick={() => { if (picked) { toggle(picked); setPicked(null); } }}>＋ Добавить в поле ответа{rule.rule_type === "unique_count_equal" && <span> · {ids.length} {presentText("фишек")}</span>}</button>}
      {rule.rule_type === "ordered_values_equal" && <div className="authored-order" aria-live="polite">{ids.length ? ids.map((id) => String(task.objects.find((object) => object.id === id)?.state.value)).join(" → ") : "Порядок пока не выбран"}</div>}
      {/connect/.test(task.interaction) && ids.length > 0 && <div className="authored-connection" aria-hidden="true">Вопрос ● ━━━━━━━━━ ● {String(answers.find((object) => object.id === ids[0])?.state.value ?? "")}</div>}
    </>}
    {rule.rule_type === "classification_equal" && <div className="authored-classification">{answers.map((object) => <div key={object.id}><MathModelView model={object.state} label={presentText(object.label)} fruit={fruit} /><div className="authored-choice-row">{["yes", "no"].map((category) => <button type="button" aria-pressed={work.categories?.[object.id] === category} className={work.categories?.[object.id] === category ? "selected" : ""} key={category} onClick={() => update({ ...work, categories: { ...work.categories, [object.id]: category } })}>{category === "yes" ? "Да" : "Нет"}</button>)}</div></div>)}</div>}
    {rule.rule_type === "cell_equal" && <div className="authored-cell-grid">{Array.from({ length: 9 }, (_, cell) => <button key={cell} type="button" aria-label={`Клетка: ряд ${Math.floor(cell / 3) + 1}, столбец ${cell % 3 + 1}`} aria-pressed={work.placements?.[rule.object_id] === cell} onClick={() => update({ ...work, placements: { [rule.object_id]: cell } })}>{work.placements?.[rule.object_id] === cell ? "●" : (models[0]?.state.reference_cells as number[] | undefined)?.includes(cell) ? "⌂" : "·"}</button>)}</div>}
    {rule.rule_type === "tick_equal" && <div className="authored-options">{Array.from({ length: Number(models[0]?.state.maximum ?? 20) - Number(models[0]?.state.minimum ?? 0) + 1 }, (_, index) => index + Number(models[0]?.state.minimum ?? 0)).map((tick) => <button type="button" className={`authored-object ${work.value === tick ? "selected" : ""}`} key={tick} aria-pressed={work.value === tick} onClick={() => update({ ...work, value: tick })}>{tick}</button>)}</div>}
    {rule.rule_type === "angle_modulo_equal" && <div className="authored-choice-row"><button type="button" onClick={() => update({ ...work, value: Number(work.value ?? 0) - 90 })}>↶ Повернуть влево</button><button type="button" onClick={() => update({ ...work, value: Number(work.value ?? 0) + 90 })}>↷ Повернуть вправо</button></div>}
    {rule.rule_type === "cover_integer_interval" && <div className="authored-pieces">{answers.map((object) => <label key={object.id}><MathModelView model={object.state} label={object.label} />Начальная клетка<select value={work.placements?.[object.id] ?? ""} onChange={(event) => { const placements = { ...work.placements }; if (event.target.value === "") delete placements[object.id]; else placements[object.id] = Number(event.target.value); update({ ...work, placements }); }}><option value="">Выбрать</option>{Array.from({ length: rule.end - rule.start }, (_, i) => i + rule.start).map((cell) => <option value={cell} key={cell}>{cell}</option>)}</select></label>)}</div>}
    {(rule.rule_type === "value_equal" || rule.rule_type === "trace_coverage") && <label className="number-answer"><span>{rule.rule_type === "trace_coverage" ? "Узнай цифру и введи её. Затем потренируй письмо на бумаге." : "Твой ответ"}</span><input aria-label="Твой ответ" inputMode="numeric" value={work.value ?? ""} onChange={(event) => update({ ...work, value: event.target.value })} /></label>}
    <div aria-live="polite">{status && <div className={`hint-panel authored-feedback authored-feedback-${status}`}>{status === "incorrect" ? <Image className="authored-feedback-mascot" src={mascot.src} alt="" width={96} height={96} sizes="64px" aria-hidden="true" /> : <span aria-hidden="true">{status === "correct" ? "★" : "◉"}</span>}<p>{presentText(task.feedback[status])}</p></div>}{progress.hints > 0 && <div className="hint-panel"><p>{presentText(task.hints[Math.min(progress.hints, task.hints.length) - 1]?.text ?? "")}</p></div>}</div>
    <div className="authored-actions"><button className="button button-primary" type="button" onClick={submit}>Проверить</button><button type="button" className="hint-button" disabled={progress.hints >= maxHints} onClick={() => onChange({ ...progress, hints: progress.hints + 1 })}>Подсказка</button><button type="button" className="hint-button" onClick={() => { update({}); setPicked(null); }}>Начать задание заново</button></div>
    {rule.rule_type === "trace_coverage" && <small>Проверяется узнавание цифры. Письмо на бумаге оценивается отдельно со взрослым.</small>}
  </section>;
}
