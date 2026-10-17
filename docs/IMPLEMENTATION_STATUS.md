# BILIM Implementation Status

Status date: 16 October 2026.

## Working now

| Area | Status | Evidence in the implementation |
|---|---|---|
| Next.js application | Working | App Router, React, TypeScript, responsive layouts and production build scripts |
| Landing page | Working | Product introduction, source-backed scope, class routes and interactive-module entry |
| Child dashboard | Working prototype | Continue card, class progress, achievements and local XP |
| Grade selection | Working | Grades 1–2 enabled; Grades 3–5 explicitly marked as planned with source limitations |
| Grade 1 curriculum | Complete as navigable draft | 33 source rows, 96 lesson-hour routes |
| Grade 2 curriculum | Complete as navigable draft | 25 source rows, 132 routes; blank source number/missing №14 preserved |
| Exercise engine | Working author draft | Six deterministic, bilingual, checked exercises for every one of 228 hours |
| Universal Lesson Engine | Working prototype | First Grade 1 lesson uses Blueprint phases A–D, adaptive spatial practice, deterministic 10-question assessment, six homework tasks and resumable local checkpoints |
| Blueprint lesson scaffolds | Generated, review-gated drafts | 163 topic records preserve track/source/week metadata and A–D scene seeds; validators are not executable and nothing is publishable |
| Spatial orientation module | Working | Four separate hours, keyboard/touch position controls, hints and deterministic checking |
| RU/KY interface | Working draft | Runtime language switch; IDs, answers and progress stay language-neutral |
| Progress | Working locally | `localStorage` completion, last lesson, stars and badges |
| Accessibility basics | Implemented | Keyboard operation, focus styles, semantic controls, touch layouts, `prefers-reduced-motion` |
| Original imagery | Implemented | Project-local Жылдыз snow-leopard mentor illustration with transparent background |
| Source transparency | Implemented | In-app sources page plus this audit; author tasks and unverified translation are labelled |

“Complete” above means that every Grade 1/2 source hour is reachable and has functioning exercises. It does **not** mean that 228 lesson scripts have received mathematics, pedagogy and Kyrgyz-language approval. The task bank uses domain-specific generators, so a methodologist must still review every generated hour and replace or enrich exercises where needed.

The new 20–25 minute estimate for the first lesson includes the four phase targets and a short homework assignment. Timings are guidance only: learner decisions never auto-advance. Other lesson-hour routes keep their previous exercise flow until separately authored and reviewed.

## Intentionally not claimed as complete

| Area | Current status | Why it is not shipped as complete |
|---|---|---|
| Grades 3–5 | Planned | Track conflicts, missing Grade 4 KTP and unconfirmed Grade 5 transition status |
| Parent accounts and child PIN | Not implemented | Requires an agreed identity/guardian model and secure backend |
| PostgreSQL/API | Not implemented | Local prototype currently stores only device-local learning progress |
| Parent analytics | Not implemented | Depends on authenticated child profiles, durable attempts and privacy rules |
| CMS/review workflow | Not implemented | Needs roles, content versions and Draft → Math → Pedagogy → RU/KY → Approved → Published states |
| School calendar plan/fact | Not implemented | School weekdays, locality calendar and overrides are absent |
| Audio | Not implemented | Voice, licensing, pronunciation review and non-audio fallback policy are unresolved |
| Production legal/security | Not complete | Formal privacy, retention, incident response, licenses and jurisdiction review are required |
| Formal accessibility certification | Not complete | Component-level WCAG 2.2 AA verification and assistive-technology tests remain |

## Implementation order from here

1. **Methodological content review:** export the 228-hour inventory, review mathematics and pedagogy, and record provenance/status per hour.
2. **Kyrgyz language review:** establish a controlled glossary, review all UI/topic/task text and add reviewed audio scripts.
3. **Authentication and durable data:** parent account, guardian verification, child profile/PIN, PostgreSQL schema, progress/attempt API, export/delete.
4. **Parent experience:** skill-level evidence, misconceptions, activity history and privacy controls.
5. **Editorial CMS:** versioned curriculum import, lesson/task editor, review gates, audit trail and safe publishing.
6. **Calendar engine:** source KTP slots, school days, locality holidays, plan/actual dates and track-safe migrations.
7. **Grades 3–5:** only after the missing official/current artifacts resolve the track and hour conflicts.
8. **Production QA:** Playwright user journeys, assistive-technology checks, security testing, performance/load targets, observability and deployment runbooks.

## Verification commands

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run generate:lesson-drafts
```

Local launch:

```powershell
npm.cmd run dev
```

Then open `http://localhost:3000`.
