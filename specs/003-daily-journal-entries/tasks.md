# Tasks: Daily Journal Entries

**Input**: Design documents from [specs/003-daily-journal-entries](specs/003-daily-journal-entries)

**Prerequisites**: [plan.md](specs/003-daily-journal-entries/plan.md), [spec.md](specs/003-daily-journal-entries/spec.md), [research.md](specs/003-daily-journal-entries/research.md), [data-model.md](specs/003-daily-journal-entries/data-model.md), [contracts/journal-entry-contract.md](specs/003-daily-journal-entries/contracts/journal-entry-contract.md), [quickstart.md](specs/003-daily-journal-entries/quickstart.md)

**Tests**: Tests are mandatory for every user story and must be written first, fail first, then pass after implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare schema, files, and test scaffolding for daily journal support.

- [X] T001 Add routine daily journal entry record type definitions in src/db/schema.ts
- [X] T002 Add Dexie table and migration version for routine journal entries in src/db/client.ts
- [X] T003 [P] Create routine journal repository file with exported API signatures in src/repositories/routineJournalRepository.ts
- [X] T004 [P] Create journal editor component shell in src/components/RoutineJournalEditor.tsx
- [X] T005 [P] Create test files for journal repository and workspace flows in src/test/repositories/routineJournalRepository.test.ts and src/test/components/RoutineWorkspace.journal.test.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core persistence and shared logic required by all user stories.

**Critical**: No user story work starts before this phase is complete.

- [X] T006 Implement get-by-routine-and-day read behavior in src/repositories/routineJournalRepository.ts
- [X] T007 Implement upsert-by-routine-and-day persistence with createdAt/updatedAt handling in src/repositories/routineJournalRepository.ts
- [X] T008 Enforce 2,000-character repository input guard and local storage error handling in src/repositories/routineJournalRepository.ts
- [X] T009 [P] Add reusable journal draft sync helpers (dirty-state, equality checks) in src/components/RoutineWorkspace.tsx
- [X] T010 Wire routine/day keyed journal data loading state into workspace lifecycle in src/components/RoutineWorkspace.tsx

**Checkpoint**: Foundation ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Capture a Daily Journal Note (Priority: P1)

**Goal**: User can write and auto-save an optional daily journal note for the selected date.

**Independent Test**: Enter text for a selected date, pause typing or blur the field, refresh, and verify note persists for that day.

### Tests for User Story 1 (Mandatory)

- [X] T011 [P] [US1] Add repository test for create-then-update upsert semantics on same routine-day in src/test/repositories/routineJournalRepository.test.ts
- [X] T012 [P] [US1] Add workspace test for rendering journal textarea between timeline and first category in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T013 [P] [US1] Add workspace test for auto-save on debounce and blur in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T014 [P] [US1] Add workspace test for 2,000-character limit enforcement in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T035 [P] [US1] Add workspace test for clearing journal text and persisting empty state after blur in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T036 [P] [US1] Add workspace test for same-date journal persistence after page remount/reload in src/test/components/RoutineWorkspace.journal.test.tsx

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement journal textarea UI, char counter, and accessibility labels in src/components/RoutineJournalEditor.tsx
- [X] T016 [US1] Place RoutineJournalEditor between timeline and first category sections in src/components/RoutineWorkspace.tsx
- [X] T017 [US1] Implement debounced auto-save and blur-save wiring to repository in src/components/RoutineWorkspace.tsx
- [X] T018 [US1] Enforce max length and optional empty state behavior in src/components/RoutineJournalEditor.tsx
- [X] T039 [US1] Implement a shared 600 ms debounce constant for journal auto-save timing in src/components/RoutineWorkspace.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - View Historical Journal Entries by Date (Priority: P1)

**Goal**: Switching selected dates loads and shows the journal text for that exact date.

**Independent Test**: Save distinct notes on two dates, switch between dates, and verify each date loads its own note.

### Tests for User Story 2 (Mandatory)

- [X] T019 [P] [US2] Add workspace test for loading correct journal text on selected date change in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T020 [P] [US2] Add workspace test for empty journal state when no record exists for selected date in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T021 [P] [US2] Add workspace test for flush-on-date-change when unsaved edits exist in src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T037 [P] [US2] Add workspace test validating journal reads/writes use the same local day key as selected-date navigation in src/test/components/RoutineWorkspace.journal.test.tsx

### Implementation for User Story 2

- [X] T022 [US2] Load routine-day journal value whenever selectedDayKey changes in src/components/RoutineWorkspace.tsx
- [X] T023 [US2] Flush pending draft before selected-day transition and then hydrate next-day value in src/components/RoutineWorkspace.tsx
- [X] T024 [US2] Keep journal loading and saving aligned to local day-key semantics in src/components/RoutineWorkspace.tsx

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Keep Journal Scoped to Routine (Priority: P2)

**Goal**: Journal entries remain isolated by routine even on the same calendar date.

**Independent Test**: Save different notes for the same day in two routines and verify each routine displays only its own note.

### Tests for User Story 3 (Mandatory)

- [X] T025 [P] [US3] Add repository test for routine isolation on same day key in src/test/repositories/routineJournalRepository.test.ts
- [X] T026 [P] [US3] Add repository test for unique composite key behavior by routineId+dayKey in src/test/repositories/routineJournalRepository.test.ts
- [X] T027 [P] [US3] Add workspace test for routine switch isolation in src/test/components/RoutineWorkspace.journal.test.tsx

### Implementation for User Story 3

- [X] T028 [US3] Ensure repository query paths always scope reads/writes by routineId and dayKey in src/repositories/routineJournalRepository.ts
- [X] T029 [US3] Reset and rehydrate journal draft on routineId changes in src/components/RoutineWorkspace.tsx
- [X] T030 [US3] Add concise non-obvious logic comments for routine/date isolation transitions in src/components/RoutineWorkspace.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and validation across all stories.

- [X] T031 [P] Update quickstart validation steps with final implemented behavior in specs/003-daily-journal-entries/quickstart.md
- [X] T032 [P] Add/adjust shared test utilities for journal setup fixtures if needed in src/test/utils.ts and src/db/seed.ts
- [X] T033 Run targeted journal test suite in src/test/repositories/routineJournalRepository.test.ts and src/test/components/RoutineWorkspace.journal.test.tsx
- [X] T034 Run full project lint and test gates via npm run lint and npm run test
- [X] T038 Add journal date-switch performance validation for <=1s p95 target in src/test/components/RoutineWorkspace.journal-performance.test.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup and blocks all user stories.
- User Story phases (Phase 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of selected user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational; no dependency on other stories.
- US2 (P1): starts after Foundational; depends on US1 editor wiring but remains independently testable by date switching.
- US3 (P2): starts after Foundational; functionally independent from US2 behavior except shared repository APIs.

### Within Each User Story

- Tests first and failing before implementation.
- Repository behavior before workspace integration.
- Core interaction flows before polishing comments/docs.

### Parallel Opportunities

- Setup: T003, T004, T005 can run in parallel after T001-T002.
- Foundational: T009 can run in parallel with T006-T008.
- US1: T011-T014, T035, and T036 can run in parallel; T015 can run in parallel with repository test work.
- US2: T019-T021 and T037 can run in parallel.
- US3: T025-T027 can run in parallel.
- Polish: T031 and T032 can run in parallel before final gate runs; T038 follows story completion.

---

## Parallel Example: User Story 1

- Run in parallel: T011, T012, T013, T014, T035, T036
- Run in parallel after tests are in place: T015 and T018

## Parallel Example: User Story 2

- Run in parallel: T019, T020, T021, T037

## Parallel Example: User Story 3

- Run in parallel: T025, T026, T027

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently with T011-T014 and manual quickstart checks.
4. Demo/deploy MVP slice.

### Incremental Delivery

1. Deliver US1 (capture + auto-save + limit).
2. Deliver US2 (historical date switching behavior).
3. Deliver US3 (cross-routine isolation guarantees).
4. Finish cross-cutting polish and full lint/test gates.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After foundation:
   - Engineer A: US1 implementation and tests.
   - Engineer B: US2 date-switch tests and integration.
   - Engineer C: US3 repository isolation and workspace routine-switch behavior.
3. Merge after independent story checkpoints pass.
