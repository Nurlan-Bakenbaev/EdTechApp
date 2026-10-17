# BILIM

BILIM is a local Next.js prototype for a bilingual mathematics school for children in Kyrgyzstan. The current working scope covers the supplied 2026/2027 thematic plans for Grades 1 and 2.

## Run locally

Requirements: Node.js 24+ and npm 11+.

```powershell
cd "C:\Users\Nolan1991\OneDrive\Desktop\coding\BILIM-AI"
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Parent account registration

The `/register` page creates a parent/guardian account. A profile nickname (including a pseudonym or character name) is optional; a legal/real name and children's personal data are not collected. Passwords must be at least 12 characters and contain an uppercase letter, a number, and a symbol. Users are advised not to reuse passwords. The registration API validates requests on the server and delegates password hashing and email confirmation to Supabase Auth; it does not use a service-role key or return authentication tokens.

The `/privacy` page is a bilingual draft describing the current prototype's data flows and linking to the Kyrgyz Digital Code. It contains unfilled operator, contact, hosting and retention details. It is not legal advice or a compliance certification; complete those details and obtain a Kyrgyz legal review before collecting real user data or opening registration publicly.

For a free testing setup, create a Supabase project and copy its project URL and publishable/anon key into the ignored `.env.local` file:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Enable email sign-up and email confirmation in Supabase Authentication, set the local Site URL to `http://localhost:3000`, and restart the dev server. Supabase's default test SMTP only sends to project team addresses and is rate-limited; configure a custom SMTP provider to test confirmation with other email addresses. Never put a Supabase service-role key in the app or share it with the browser. Keep Supabase Auth's email confirmation and abuse/rate protections enabled. CAPTCHA is not integrated into this prototype yet, so add and verify a provider-supported CAPTCHA before opening registration publicly. This prototype stores no child profiles or lesson progress in Supabase yet. Review applicable privacy/child-data requirements before production.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run lint
npm.cmd run build
```

## Implemented scope

- responsive landing page, class selector, child dashboard, curriculum explorer and lesson routes;
- Russian and Kyrgyz UI switcher;
- all 33 Grade 1 topic rows/96 hours and 25 Grade 2 rows/132 hours;
- 228 navigable lesson-hour routes with six deterministic tasks each;
- a four-phase Lesson Engine for the first Grade 1 lesson, with adaptive practice, a 10-question independent test, six homework activities and resumable local checkpoints;
- Blueprint JSON scaffolds for all 163 topics, generated as non-publishable review drafts;
- browser-local progress and achievements;
- original mentor illustration and reduced-motion support.

The Kyrgyz translations, per-hour lesson scripts and exercise banks are authorial drafts that require linguistic and methodological review. The supplied source set calls the curriculum PDFs "примерный" plans; the app does not represent them as proof of accreditation or approval.

Generate or refresh the Blueprint-derived editorial scaffolds with `npm.cmd run generate:lesson-drafts`. This copies source metadata and proposed scene text into `content/lesson-drafts.json`; validators are not executable, translations are incomplete, all reviews remain pending, and every generated item is locked as a draft.

See [docs/SOURCE_AUDIT.md](docs/SOURCE_AUDIT.md) and [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md).

The PDF-ready, expanded engineering and methodology specification is [BILIM_Architectural_Educational_Blueprint_v1.1.md](docs/BILIM_Architectural_Educational_Blueprint_v1.1.md). Regenerate all 163 topic passports after editing the machine-readable Blueprint with `npm.cmd run generate:blueprint-spec`; generated lesson plans remain drafts until reviewed.
