# Tasks: Mindful Routine Tracker

**Input**: Design documents from `specs/001-mindful-routine-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Vitest + React Testing Library tests are mandatory for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript React app shell, tooling, and baseline file structure.

- [X] T001 Initialize the Vite + React + TypeScript project scaffold in `package.json`, `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, and `index.html`
- [X] T002 Configure Tailwind CSS and global app styles in `tailwind.config.ts`, `postcss.config.js`, and `src/index.css`
- [X] T003 [P] Add lint, test, and build scripts plus Vitest setup in `package.json`, `vitest.config.ts`, and `src/test/setup.ts`
- [X] T004 [P] Add PWA manifest and icon asset placeholders in `public/manifest.webmanifest` and `public/icons/`
- [X] T005 Create the core source folder layout in `src/app/`, `src/db/`, `src/repositories/`, `src/services/`, `src/utils/`, `src/components/`, and `src/test/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core local persistence, utilities, and app wiring that must exist before any user story implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Implement the Dexie database client and versioned schema in `src/db/client.ts` and `src/db/schema.ts`
- [X] T007 [P] Add initial seed data for routines, categories, habits, and entries in `src/db/seed.ts`
- [X] T008 [P] Implement date boundary helpers for device-local day reset and Sunday-start weeks in `src/utils/dateBoundaries.ts`
- [X] T009 [P] Implement the approved pastel palette and token lookup utilities in `src/utils/pastelPalette.ts`
- [X] T010 [P] Implement the standalone URL codec utility for share payload compression/expansion in `src/utils/urlCodec.ts`
- [X] T011 Implement repository CRUD entry points for routines, categories, habits, and entries in `src/repositories/routinesRepository.ts`, `src/repositories/categoriesRepository.ts`, `src/repositories/habitsRepository.ts`, and `src/repositories/entriesRepository.ts`
- [X] T012 [P] Implement shared service shells for timeline computation and sharing flow in `src/services/timelineService.ts` and `src/services/sharingService.ts`
- [X] T013 Build the app shell, router, and persistent bottom navigation in `src/app/AppShell.tsx`, `src/app/Router.tsx`, and `src/app/BottomNavBar.tsx`
- [X] T014 [P] Add shared test utilities and render helpers in `src/test/utils.ts` and `src/test/setup.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Create and Track Mindful Routines (Priority: P1) 🎯 MVP

**Goal**: Users can create routines, categories, and habits, then record daily and weekly habit entries locally without signing up.

**Independent Test**: Create one routine with at least one category and one habit of each tracking type, record entries for the current day/week, and verify persistence after app restart.

### Tests for User Story 1 (MANDATORY) ⚠️

> **NOTE: Write these tests FIRST, ensure they fail before implementation.**

- [X] T015 [P] [US1] Add repository CRUD tests for routine creation, category nesting, and habit persistence in `src/test/repositories/routinesRepository.test.ts`
- [X] T016 [P] [US1] Add workspace interaction tests for habit entry creation and measurement autosave in `src/test/components/RoutineWorkspace.test.tsx`

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement routine create/edit/delete flows in `src/repositories/routinesRepository.ts` and `src/components/RoutineWorkspace.tsx`
- [X] T018 [P] [US1] Implement category and habit creation/editing controls in `src/components/CategoryAccordion.tsx` and `src/components/HabitRow.tsx`
- [X] T019 [US1] Implement Yes/No and Counter entry interactions plus local write-through updates in `src/components/HabitRow.tsx` and `src/services/timelineService.ts`
- [X] T020 [US1] Implement measurement blur autosave and read-mode transition in `src/components/HabitRow.tsx`
- [X] T021 [US1] Wire live query-backed persistence for the routine workspace in `src/app/Router.tsx`, `src/app/AppShell.tsx`, and `src/components/RoutineWorkspace.tsx`
- [X] T048 [US1] Implement non-destructive storage-pressure handling, retry guidance, and user-safe error messaging in `src/repositories/entriesRepository.ts` and `src/components/HabitRow.tsx`

**Checkpoint**: User Story 1 should now be fully functional and testable independently.

---

## Phase 4: User Story 2 - Navigate Calm, Focused Views (Priority: P2)

**Goal**: Users can move between Home and All Routines, see active/paused segmentation, and use a compact mobile-friendly workspace with collapsible sections.

**Independent Test**: Create multiple routines, switch between Home and All Routines, verify active/paused segmentation and toggles, and confirm accordion behavior in the workspace.

### Tests for User Story 2 (MANDATORY) ⚠️

- [X] T022 [P] [US2] Add dashboard tests for greeting, recent routines, and empty state behavior in `src/test/components/DashboardView.test.tsx`
- [X] T023 [P] [US2] Add directory tests for active/paused segmentation and inline toggles in `src/test/components/AllRoutinesView.test.tsx`
- [X] T024 [P] [US2] Add navigation and accordion tests for bottom nav routing and default-open category behavior in `src/test/components/BottomNavBar.test.tsx` and `src/test/components/CategoryAccordion.test.tsx`

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement the Home dashboard with time-of-day greeting, recent active routines, and empty state in `src/components/DashboardView.tsx`
- [X] T026 [P] [US2] Implement the All Routines directory with active/paused sections and inline state toggles in `src/components/AllRoutinesView.tsx`
- [X] T027 [US2] Implement bottom navigation and view switching in `src/app/BottomNavBar.tsx` and `src/app/Router.tsx`
- [X] T028 [US2] Ensure the routine workspace opens the first category by default and keeps remaining categories collapsed in `src/components/CategoryAccordion.tsx`
- [X] T029 [US2] Connect Home and Directory views to live database queries in `src/app/AppShell.tsx` and `src/components/DashboardView.tsx`

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Preserve History and Share Structure Safely (Priority: P3)

**Goal**: Historical tiles remain unchanged when habits change, and users can export/import structure-only share links without leaking personal logs.

**Independent Test**: Log history, modify/archive/delete a habit, verify historical visuals remain unchanged, then export and import a routine link and verify the imported copy contains structure only.

### Tests for User Story 3 (MANDATORY) ⚠️

- [X] T030 [P] [US3] Add timeline service tests for 120-day daily windows, Sunday-start weekly periods, and history preservation in `src/test/services/timelineService.test.ts`
- [X] T031 [P] [US3] Add sharing and import tests for structure-only payloads, duplicate-title suffixes, and cancel/error behavior in `src/test/services/sharingService.test.ts`
- [X] T032 [P] [US3] Add import preview dialog tests for confirmation and rejection flows in `src/test/components/ImportPreviewDialog.test.tsx`

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement timeline computation and historical tile generation in `src/services/timelineService.ts` and `src/utils/dateBoundaries.ts`
- [X] T034 [P] [US3] Implement the parallel timeline UI in `src/components/ParallelTimelines.tsx`, `src/components/DailyGrid.tsx`, and `src/components/WeeklyRibbon.tsx`
- [X] T035 [P] [US3] Implement random pastel token selection and tile color assignment in `src/utils/pastelPalette.ts` and `src/services/timelineService.ts`
- [X] T036 [P] [US3] Implement share payload export and URL-safe compression in `src/services/sharingService.ts` and `src/utils/urlCodec.ts`
- [X] T037 [US3] Implement import route parsing, confirmation preview, and duplicate-title suffix handling in `src/components/ImportPreviewDialog.tsx` and `src/app/Router.tsx`
- [X] T038 [US3] Preserve historical tiles when habits are edited, archived, or deleted by updating `src/repositories/habitsRepository.ts` and `src/services/timelineService.ts`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: PWA Optimization

**Purpose**: Offline installability, service worker caching, and app manifest completeness.

- [ ] T039 [P] Configure the Vite PWA plugin, manifest, and icon references in `vite.config.ts`, `public/manifest.webmanifest`, and `public/icons/`
- [ ] T040 [P] Register the service worker, app bootstrap, and offline startup behavior in `src/main.tsx` and `src/app/AppShell.tsx`
- [ ] T041 [P] Add offline caching and fallback behavior validation in `src/test/components/AppShell.test.tsx` and `src/test/services/offlineCache.test.ts`
- [ ] T042 [P] Add storage-full and unavailable-write failure tests for non-destructive retry behavior in `src/test/repositories/entriesRepository.test.ts`
- [ ] T043 [P] Add palette membership and contrast-threshold tests for the approved pastel set in `src/test/services/timelineService.test.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, accessibility, and documentation polish across stories.

- [ ] T044 [P] Refine Tailwind spacing, responsive layouts, and soft pastel styling in `src/index.css` and `src/components/*.tsx`
- [ ] T045 [P] Add accessibility labels, focus states, and reduced-motion handling in `src/components/*.tsx` and `src/app/BottomNavBar.tsx`
- [ ] T046 Validate the quickstart and README usage flow in `specs/001-mindful-routine-tracker/quickstart.md` and `README.md`
- [ ] T047 Run lint, unit tests, and component tests, then fix any failures in `package.json` and `src/**`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **PWA Optimization (Phase 6)**: Depends on core app shell and routing being in place.
- **Polish (Phase 7)**: Depends on desired user stories and PWA work being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories once Foundation is complete.
- **User Story 2 (P2)**: Can proceed after Foundation; may reuse Story 1 data but remains independently testable.
- **User Story 3 (P3)**: Can proceed after Foundation; may reuse Story 1/2 UI shell but remains independently testable.

### Within Each User Story

- Tests MUST be written and fail before implementation.
- Repository/data changes before view wiring.
- Shared utilities before feature-specific components.
- Story complete before moving to the next priority.

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel where files do not overlap.
- Foundational tasks marked [P] can run in parallel after the scaffold exists.
- All tests for a given user story marked [P] can run in parallel.
- Story implementation tasks touching different files can run in parallel.
- Story phases can be worked on sequentially or by different contributors once the foundation is complete.

---

## Parallel Example: User Story 1

```bash
Task: "Add repository CRUD tests for routine creation, category nesting, and habit persistence in src/test/repositories/routinesRepository.test.ts"
Task: "Add workspace interaction tests for habit entry creation and measurement autosave in src/test/components/RoutineWorkspace.test.tsx"
Task: "Implement routine create/edit/delete flows in src/repositories/routinesRepository.ts and src/components/RoutineWorkspace.tsx"
Task: "Implement category and habit creation/editing controls in src/components/CategoryAccordion.tsx and src/components/HabitRow.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. STOP and validate User Story 1 independently.
5. Demo or iterate before expanding scope.

### Incremental Delivery

1. Setup + Foundation -> app scaffold ready.
2. Add User Story 1 -> core routine tracking MVP.
3. Add User Story 2 -> calm navigation and workspace flow.
4. Add User Story 3 -> history-preserving visualization and sharing.
5. Add PWA optimization -> install/offline refinement.
6. Finish with polish and cross-cutting quality checks.

### Parallel Team Strategy

1. One contributor can complete Setup + Foundation.
2. After Foundation, one contributor can work on User Story 1 while another works on User Story 2.
3. User Story 3 and PWA optimization can proceed in parallel once the shared data and view shells are stable.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to a specific user story for traceability.
- Each user story should be independently completable and testable.
- Verify tests fail before implementing feature code.
- Avoid vague tasks, shared-file conflicts, and cross-story coupling that breaks independence.
