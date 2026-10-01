# Northstar — SAP ABAP Learning Platform

A responsive, self-guided SAP ABAP course built around Khoa’s six-month roadmap. It follows the PDF’s October 2026 to March 2027 target, its roughly 800-hour study investment, and its priorities: hands-on SAP development, two portfolio projects, English for global delivery, and certification preparation.

## Features

- Six-month roadmap with monthly outcomes, study-hour targets, and project milestones.
- A staged course player with a lesson outline, prerequisite locks, learn/see/try/check/apply stages, saved notes, and reflection.
- 40 structured lessons with objectives, beginner-friendly concepts, worked examples, common mistakes, practical tasks, expected results, checkpoints, and quizzes.
- Rich lesson experiences for major topics, with business scenarios, visual flows, interview connections, and project links.
- Month checkpoints and seven boss challenges that unlock the next phase after their lesson requirements and deliverables are complete.
- An interactive knowledge map, course hub with weekly goals, spaced-review queue, and an internal completion certificate.
- A simulated ABAP playground with editable starter code, hints, expected output, validation feedback, and saved attempts.
- Two guided portfolios: a Classic ABAP order-monitoring report and a Modern S/4HANA CDS/RAP/OData/Fiori Elements application.
- Quiz feedback and best scores; lesson stages and reflections, project, English, certification, checkpoint, and review progress.
- English practice for SAP meetings, requirement clarification, technical updates, test results, code review, incidents, documentation, and interviews.
- Certification review domains with a reminder to verify current exam details on SAP’s official platform.
- Search across lessons, topics, projects, and glossary definitions.
- Today’s study session, weekly review, interview practice, searchable glossary, dark/light theme, and JSON progress import/export.
- Responsive layout, keyboard-visible focus, semantic controls, and reduced-motion support.

## Tech stack

React 18, TypeScript, Vite, Lucide icons, and modern CSS. Version 1 has no backend; progress is stored in this browser’s `localStorage` under `sap-abap-course-progress`.

## Installation

Requires Node.js 20 or newer.

```bash
npm.cmd install
npm.cmd run dev
```

These commands use the Node.js npm executable directly in Windows PowerShell. In this workspace, the bare `npm` command resolves to a silent Windows System32 stub. In macOS/Linux shells, use `npm install` and `npm run dev`.

## Production build

```bash
npm.cmd run build
npm.cmd run preview
```

## Course architecture

```text
src/
  components/       Course player, learning dashboard, map, challenges, review, and shared UI
  data/             Curriculum, lesson experiences, projects, and product content
  pages/            Supporting project, roadmap, English, certification, and reference views
  utils/             Progress storage, import validation, and activity tracking
  App.tsx            Navigation, search, and shared progress state
  types.ts           Curriculum and persisted-progress types
  styles.css         Responsive theme and component styles
```

The 40 lessons are grouped into six month plans in `src/data/curriculum.ts`. Every lesson has a stable ID so progress remains associated with the correct content. `src/data/learningExperience.ts` adds hooks, visual models, real-world stories, guided practice, varied knowledge checks, prerequisites, review cards, and checkpoint challenges; lessons without a bespoke experience still receive a structured practice flow. Project tasks, interview prompts, English tracks, certification domains, official learning links, and glossary entries are in `src/data/resources.ts`. `validateCurriculum()` checks lesson IDs, month references, and quiz answer indexes during development.

The target plan uses October 2026 through March 2027 because the PDF targets approximately March 2027 and this implementation begins in September 2026. Monthly targets of 135 hours make the planned total 810 hours, consistent with the PDF’s approximate 800-hour goal and 30–35 hours per week.

## Progress storage

Progress is saved locally in the current browser. It includes completed lessons and stages, best quiz scores, lesson notes and reflections, playground attempts, review schedules, project checklists, boss challenge tasks, English and certification review, weekly review notes, study days, duration, theme, and streak. Import validates the JSON shape and filters IDs against current course data. Export downloads a portable JSON backup. Clearing browser storage removes progress unless it has been exported.

## How to add lessons

Add a `Lesson` entry in `src/data/curriculum.ts` with a unique ID, valid month and week, objective, concept, relevance, example, code explanation, two mistakes, exercise, expected result, two checkpoints, and a quiz. The course library and search render lessons from this data. Run `npm run build` to check the TypeScript types and course-data validation.

## How to add quizzes

Add one or more `QuizQuestion` entries to a lesson’s `quiz` array. Each question has a prompt, options, the zero-based correct answer index, and an explanation. Keep the answer index within the options array.

## How to add projects

Add a project in `src/data/resources.ts` with a unique ID, architecture, technologies, and uniquely identified tasks. Each task should describe the work and a reviewable deliverable. Progress uses these task IDs, so keep IDs stable after learners start checking them off.

## SAP content and release awareness

Code samples and table names are instructional examples; they are not a runnable SAP system or a substitute for checking the target system’s release, available APIs, and authorization model. RAP, CDS, Fiori, ABAP Cloud, and certification details can depend on product edition or release. Certification information is deliberately presented as a roadmap target, with an instruction to verify the current exam before registering.

The certification page links to SAP Learning and SAP Help resources, including official beginner ABAP content and RAP guidance. Prefer the target system’s release-matched SAP documentation when exercising a lesson.

## Future backend plan

The current browser-only client can evolve into a React frontend backed by a Node.js/NestJS API and PostgreSQL. An authenticated backend could store learner profiles, progress, quiz attempts, and portfolio evidence; add server-side validation and migrations; and support deployment. Preserve the current curriculum IDs and define a versioned API before migrating local progress.
