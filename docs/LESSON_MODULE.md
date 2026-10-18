# Grade 1 lesson module

Implemented from `task/how_lessons_tobe_build.txt`. Videos and video authoring are reserved for the owner. The existing explanation stages remain available while videos are prepared.

- `components/LessonExercises.tsx` uses the existing curriculum-specific exercise bank. Choice questions rotate through answer-card drag and drop, connecting a question to its selected answer with an SVG line, and multiple choice. Numeric questions retain number entry. Drag interactions also support selecting a card and pressing the basket, including on touchscreens and with a keyboard. Incorrect attempts show a mascot hint and allow retries without a penalty.
- `components/ArbeitsblattGenerator.tsx` exposes a print/PDF action on lesson pages. It prints the current lesson's six exercises and illustrations, number tracing, a short arithmetic warm-up, and an optional parent answer page. The answer page is excluded by default. PDF saving uses the browser's print dialog.
- `components/LessonRewards.tsx` celebrates completion with canvas-confetti, honors reduced motion, and displays three stars per completed lesson and saved XP. Stars are derived from the persisted completion list. The existing `completeLesson` operation awards 60 XP only once per lesson. All progress remains local to the browser.
- The authored 85-lesson course also awards one-time, integer point bonuses. Each topic has exactly 100 points distributed by distinct assessment count, interaction variety, and rule complexity; the course map and lesson pages show both the available lesson reward and topic progress. Topic totals are derived from completed lesson IDs, so repeat visits cannot exceed the 100-point cap. `scripts/prepare-authored-lessons.mjs` recalculates the difficulty weights and allocations whenever the authored course is regenerated.
- `components/lesson-adventure-map.tsx` shows a window of eight Grade 1 steps around the next unfinished lesson on the dashboard. Completing a step opens its successor. The curriculum explorer remains available for browsing every draft lesson.

`LessonPage` connects exercises to completion and displays the worksheet action throughout the lesson. The first spatial lesson retains its existing adaptive engine, independent assessment, homework, and saved checkpoints. Grade 2 retains its existing practice runner. The lesson route keys each page by lesson ID so local exercise state resets when navigating between hours.

The existing Russian and Kyrgyz curriculum text is reused. These exercises remain authorial drafts requiring the same methodology and language review described in `IMPLEMENTATION_STATUS.md`.

Validation: component interaction tests cover answer placement, gentle retries, matching connections, optional print answers, duplicate reward prevention, and adventure-map unlocking. Run the normal `test`, `typecheck`, `lint`, and `build` scripts.
