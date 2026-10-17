# BILIM Source Audit

Audit date: 15 October 2026. The purpose of this audit is to separate verified source facts from project assumptions and author-created learning content.

## Inventory result

The initial workspace contained nine files: one Markdown instruction file, two DOCX specifications and six PDFs. No XLS, XLSX, CSV, TSV, HTML, JavaScript, TypeScript, CSS, package manifest or existing frontend source was present. The `app` directory was empty. The “existing frontend prototype” and the companion Excel registry mentioned in the specifications therefore could not be reviewed.

| File | Verified inspection | Extracted requirements or facts | Missing or uncertain information |
|---|---|---|---|
| `AGENTS.md.md` | Read in full, 641 lines | Product vision; required screens; RU/KY; child and parent separation; Жылдыз mentor; animation, reduced-motion, curriculum isolation, tests and staged roadmap | Uses legacy brand SANAK SCHOOL while the current user names the product BILIM; no attached frontend source |
| `docs/Lastenheft_Math_Kyrgyzstan_Curriculum_RU_KY_v4.docx` | Full text, 89 non-empty paragraphs, 4 tables/28 rows; header/footer and structure inspected | Grades 1–5, RU/KY, roles, curriculum/track isolation, lesson pedagogy, first spatial module, deterministic checking, privacy, content provenance and QA | Design document, not accreditation; Kyrgyz review evidence absent; section 14 is missing from numbering |
| `docs/Pflichtenheft_Online_Math_Kyrgyzstan_1-5_2026-2027.docx` | Full text, 135 paragraphs, 30 tables/314 rows; header/footer and structure inspected | FR-01–17, CAL-01–06, data model/API, six curriculum profiles, lesson contract, review workflow, acceptance criteria, topic registries and open issues | Status is “project for approval”; referenced Excel with 874 slots absent; saved page-count metadata is stale; no verified per-hour scripts/answers |
| `curriculum/3.-КТП_1-класс_математика_русск_2026.pdf` | All 3 pages extracted and inspected; SHA-256 `45595fea...cd934` | “Примерный” KTP, 2026/2027, 3 hours/week, 33 topic rows, exactly 96 hours. Topic 1 is “Ориентация в пространстве”, 4 hours | No approval order/signature/official URL inside the PDF; dates are blank; Russian only; document itself does not name the 12-year track |
| `curriculum/3.-КТП_2-класс_Математика_русск_2026.pdf` | All 4 pages inspected; page 4 is blank; SHA-256 `2b99f944...49e0d` | “Примерный” KTP, 2026/2027, 4 hours/week for 33 weeks, 25 physical topic rows, exactly 132 hours | Row 2 has no printed number; numbering later jumps 13→15; no approval evidence, dates or Kyrgyz version |
| `curriculum/4.-Математика-КТП_3-класс_2026_русск-1.pdf` | All 3 pages inspected | Department-branded example KTP, 41 topics, 136 hours (`4 × 34`) | Track is not stated. It resembles the new 12-year sequence, but that is an inference, not a PDF fact |
| `curriculum/6.-КТП-5-кл-Мат_2026-год.pdf` | All 3 pages inspected | 170 hours: first semester is Grade 5 content (85), second semester Grade 6 content (85) | The file does not itself call the course “integrated” or cite the transition order; formal status is unverified |
| `curriculum/973-1-11.pdf` | All 18 pages inspected; no attachments/outline | Official Order №973/1 dated 10 July 2026 for the continuing 11-year track; Grades 3–4 mathematics 5 hours/week; year boundaries, lesson length and homework limits | Referenced appendices 1 and 2 are not contained in this copy; no topic sequence; no detailed Grade 4 KTP |
| `curriculum/Математика-1-4-классы.pdf` | All 29 pages inspected | 2019 subject standard with eight content lines, expected results, assessment and resources for Grades 1–4 | Legacy reference, not the 2026/2027 KTP. Its weekly hours conflict with Order №973/1 for Grade 4; an internal Grade 3 number-range inconsistency exists |

DOCX visual rendering was attempted through the packaged workflow, but the Windows runtime did not contain the required bundled `soffice.exe`. Content/OOXML inspection succeeded; a full rendered-page visual QA claim is therefore not made.

## Confirmed Grade 1 and Grade 2 scope

| Profile | Source-supported volume | Product treatment |
|---|---:|---|
| Grade 1 | 33 topic rows, 96 academic hours | All rows and hours preserved; Topic 1 is a four-hour module |
| Grade 2 | 25 physical rows, 132 academic hours | Source order stored separately from printed number; blank number and missing №14 preserved |

The 58 topic rows and 228 hours are source-backed. The individual per-hour lesson titles, explanations, interaction scenarios and six exercises generated for each hour are BILIM author-created content. They are labelled `draft-review-required` and must not be represented as official KTP wording or methodologist-approved material.

## Requirements traceability

| Requirement group | Lastenheft | Pflichtenheft | Current interpretation |
|---|---|---|---|
| RU/KY parity | Required for UI, lessons, hints, homework and reports | FR-12 plus review workflow | Language-neutral IDs/answers; current Kyrgyz copy is an unverified editorial draft |
| Curriculum/track isolation | Explicit | Six profiles, versioned keys and provenance fields | Grade 3+ stays planned until conflicting tracks can be resolved |
| Lesson pedagogy | prerequisite → model → guided → independent → homework/review | Per-hour contract and 5–8 homework items | Prototype supplies a goal, manipulation for the first module, six checked tasks, hints and feedback |
| Deterministic validation | Required | FR-08 and validator boundary | Implemented locally; no AI judges mathematical correctness |
| Child safety | Parent-controlled account, no public child profile, no ads/open chat | FR-01/16/17 and NFR security/privacy | Prototype has no external account/backend, ads, chat or third-party tracking; browser-local progress only |
| Accessibility | Keyboard/touch, reduced motion | WCAG 2.2 AA target | Keyboard controls, visible focus and reduced-motion CSS implemented; formal WCAG audit remains pending |
| Parent dashboard/CMS | Required | FR-13/14 | Not in this local prototype; needs database, authentication, permissions and editorial workflow |

## Source conflicts and decisions

1. Product name: the active name is **BILIM** because it is the user’s latest explicit instruction. SANAK SCHOOL and KG MATH SCHOOL are retained only as legacy source names.
2. The Grade 1 source PDF says “Ориентация в пространстве”; one specification appendix normalizes it as “Ориентировка”. The UI preserves the supplied PDF/user wording.
3. One academic hour is not treated as one screen. Each hour is a route containing an introduction and six checked activities.
4. The Grade 1 first topic is not collapsed into a single lesson: it has four separate hours for left/right, relative position, above/below and front/behind/perspective.
5. Grade 3 is not published as one unconditional program because the 136-hour KTP conflicts with the 170-hour continuing 11-year track.
6. Grade 4 remains planned because a detailed 2026/2027 KTP is absent.
7. Grade 5 remains planned because the 5+6 sequence is visible but its formal transition status is not documented in the supplied file set.

## Missing material required before production publication

- companion Excel/CSV registry for the stated 874 project slots;
- complete current basic-plan appendices and the missing 12-year-track order/source;
- detailed Grade 4 and continuing 11-year Grade 3 school KTPs;
- verified Kyrgyz curriculum wording, glossary and native-speaker/mathematics-teacher approvals;
- named methodologist review records and per-hour source/provenance decisions;
- exact school weekdays, locality calendars and plan/fact override data;
- authentication, guardian verification, child PIN/recovery, retention/export/delete policy and data-residency requirements;
- licensed audio policy, content/image/font registry and production legal review;
- supported-browser/load/availability/backup/incident-response targets;
- final decision on subscriptions/payments and the proposed mastery threshold.
