# Tasks: Historical Navigation and Backdating

**Input**: Design documents from `/specs/002-historical-backdating/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are mandatory for this feature. Include Vitest + React Testing Library coverage per user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare baseline artifacts and test scaffolding for historical-date behavior.

- [ ] T001 Align feature-level quickstart workflow in specs/002-historical-backdating/quickstart.md
- [ ] T002 Add normalized historical-date helper coverage scaffolding in src/test/utils.ts
- [ ] T003 [P] Add repository test fixture builders for habit lifecycle windows in src/test/utils.ts
- [ ] T004 [P] Add date-navigation component test harness setup in src/test/components/RoutineWorkspace.test.tsx
- [ ] T005 [P] Add repository contract test harness for habit/date composite-key scenarios in src/test/repositories/entriesRepository.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core data integrity and lifecycle capabilities required by all stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [ ] T006 Add habit deletion lifecycle field migration support in src/db/schema.ts
- [ ] T007 [P] Update seed compatibility for deleted lifecycle fields in src/db/seed.ts
- [ ] T008 Enforce composite habitId+logDate uniqueness access path in src/repositories/entriesRepository.ts
- [ ] T009 [P] Extend habit lifecycle query primitives for date-window filtering in src/repositories/habitsRepository.ts
- [ ] T010 [P] Add normalized selected-date boundary utilities in src/utils/dateBoundaries.ts
- [ ] T011 Add shared selected-date read model types for fallback metadata in src/services/timelineService.ts

**Checkpoint**: Foundation complete. User stories can now be implemented.

---

## Phase 3: User Story 1 - Historical Entry Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can switch to past dates and log/edit the state for that selected day without affecting other dates.

**Independent Test**: Select yesterday, update one habit, switch back to today, and verify only yesterday changed.

### Tests for User Story 1 (MANDATORY)

- [ ] T012 [P] [US1] Add date-switch rendering test for selected-date checklist in src/test/components/RoutineWorkspace.historical-navigation.test.tsx
- [ ] T013 [P] [US1] Add repository test for selected-date habit visibility query in src/test/repositories/habitsRepository.date-filter.test.ts

### Implementation for User Story 1

- [ ] T014 [P] [US1] Add selectedDate state and navigation actions in src/components/RoutineWorkspace.tsx
- [ ] T015 [P] [US1] Implement selected-date habit fetch API in src/repositories/habitsRepository.ts
- [ ] T016 [US1] Integrate selected-date checklist data flow in src/components/DailyGrid.tsx
- [ ] T017 [US1] Wire selected-date navigation controls and bounds behavior in src/components/ParallelTimelines.tsx
- [ ] T018 [US1] Connect selected-date route/view state handling in src/app/Router.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Idempotent Daily Updates (Priority: P1)

**Goal**: Repeated updates on the same day modify one existing daily record instead of creating duplicates.

**Independent Test**: Toggle the same habit multiple times on one day and confirm one persisted habit-date record with final values.

### Tests for User Story 2 (MANDATORY)

- [ ] T019 [P] [US2] Add repository upsert idempotency test for repeated same-day writes in src/test/repositories/entriesRepository.idempotent.test.ts
- [ ] T020 [P] [US2] Add repeated-interaction UI state test for same-day updates in src/test/components/HabitRow.idempotent-updates.test.tsx

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement upsert-by-(habitId,logDate) write path in src/repositories/entriesRepository.ts
- [ ] T022 [P] [US2] Route daily save orchestration through upsert service flow in src/services/timelineService.ts
- [ ] T023 [US2] Update habit interaction handlers to use idempotent save semantics in src/components/HabitRow.tsx
- [ ] T024 [US2] Ensure workspace refresh/state reconciliation after repeated writes in src/components/RoutineWorkspace.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Habit Evolution with Historical Preservation (Priority: P2)

**Goal**: Renames and deletion lifecycle changes preserve historical logs while current/future visibility obeys soft-delete rules.

**Independent Test**: Rename then soft-delete a habit with past logs; verify past-date visibility remains and current/future visibility is removed.

### Tests for User Story 3 (MANDATORY)

- [ ] T025 [P] [US3] Add soft-delete lifecycle repository test for historical retention in src/test/repositories/habitsRepository.soft-delete.test.ts
- [ ] T026 [P] [US3] Add date-window visibility component test for deleted habits in src/test/components/DailyGrid.deletion-window.test.tsx
- [ ] T040 [P] [US3] Add rename-and-criteria-update linkage test to verify historical records remain bound to the same habit identity in src/test/repositories/habitsRepository.rename-history-linkage.test.ts

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement soft-delete mutation and lifecycle fields in src/repositories/habitsRepository.ts
- [ ] T028 [P] [US3] Preserve habit identity linkage during rename/edit flows in src/components/CategoryAccordion.tsx
- [ ] T029 [US3] Implement date-valid habit filtering (active OR deleted-after-date) in src/repositories/habitsRepository.ts
- [ ] T030 [US3] Merge lifecycle-filtered habits with same-day records in src/services/timelineService.ts

**Checkpoint**: User Stories 1-3 are independently functional and testable.

---

## Phase 6: User Story 4 - Visual Continuity and Graceful Fallback (Priority: P3)

**Goal**: Past-date checklist visuals stay consistent, and mismatched legacy values render deterministic fallback states.

**Independent Test**: Load a past day containing a type-mismatched historical record and verify checkbox-complete fallback with no numeric display.

### Tests for User Story 4 (MANDATORY)

- [ ] T031 [P] [US4] Add cross-date checklist style continuity test in src/test/components/DailyGrid.visual-continuity.test.tsx
- [ ] T032 [P] [US4] Add mismatched-value fallback rendering test in src/test/components/HabitRow.type-mismatch-fallback.test.tsx

### Implementation for User Story 4

- [ ] T033 [P] [US4] Implement fallback projection metadata mapping in src/services/timelineService.ts
- [ ] T034 [US4] Render checkbox-complete/no-numeric fallback state in src/components/HabitRow.tsx
- [ ] T035 [US4] Apply unified checklist completion styling across selected dates in src/components/DailyGrid.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across all stories.

- [ ] T036 [P] Add end-to-end historical regression component test in src/test/components/RoutineWorkspace.history-regression.test.tsx
- [ ] T037 [P] Add service-level merge/fallback regression test in src/test/services/timelineService.historical-read.test.ts
- [ ] T038 Update manual validation checklist with final verification outcomes in specs/002-historical-backdating/quickstart.md
- [ ] T039 Add concise non-obvious logic comments for fallback merge behavior in src/services/timelineService.ts
- [ ] T041 Add selected-date navigation/render performance validation for <=1s p95 target in src/test/components/RoutineWorkspace.performance.test.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Phase 1 and blocks all user stories.
- User Story phases (Phase 3-6): depend on Phase 2 completion.
- Polish (Phase 7): depends on completion of selected user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational; no dependency on other stories.
- US2 (P1): starts after Foundational; functionally independent, but can reuse US1 date state plumbing.
- US3 (P2): starts after Foundational; independent of US1/US2 behavior.
- US4 (P3): starts after Foundational; independent fallback/visual behavior layered on selected-date data.

### Within Each User Story

- Tests first and failing before implementation.
- Repository/model behavior before service orchestration.
- Service orchestration before component integration.
- Story checkpoint must pass before moving on.

## Parallel Opportunities

- Setup tasks marked [P] can run in parallel.
- Foundational tasks T007, T009, and T010 can run in parallel.
- After Foundational checkpoint, US1-US4 can be staffed in parallel.
- In each story, [P] test tasks and [P] implementation tasks can run in parallel when they touch different files.

## Parallel Example: User Story 1

```bash
# Parallel test work
T012 src/test/components/RoutineWorkspace.historical-navigation.test.tsx
T013 src/test/repositories/habitsRepository.date-filter.test.ts

# Parallel implementation work
T014 src/components/RoutineWorkspace.tsx
T015 src/repositories/habitsRepository.ts
```

## Parallel Example: User Story 2

```bash
# Parallel test work
T019 src/test/repositories/entriesRepository.idempotent.test.ts
T020 src/test/components/HabitRow.idempotent-updates.test.tsx

# Parallel implementation work
T021 src/repositories/entriesRepository.ts
T022 src/services/timelineService.ts
```

## Parallel Example: User Story 3

```bash
# Parallel test work
T025 src/test/repositories/habitsRepository.soft-delete.test.ts
T026 src/test/components/DailyGrid.deletion-window.test.tsx

# Parallel implementation work
T027 src/repositories/habitsRepository.ts
T028 src/components/CategoryAccordion.tsx
```

## Parallel Example: User Story 4

```bash
# Parallel test work
T031 src/test/components/DailyGrid.visual-continuity.test.tsx
T032 src/test/components/HabitRow.type-mismatch-fallback.test.tsx

# Parallel implementation work
T033 src/services/timelineService.ts
T034 src/components/HabitRow.tsx
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) and validate independently.
3. Demo/deploy MVP with date navigation and date-scoped editing.

### Incremental Delivery

1. Add US2 for idempotent single-state integrity.
2. Add US3 for lifecycle-safe historical preservation.
3. Add US4 for visual continuity and deterministic fallback behavior.
4. Execute Phase 7 polish and full regression checks.

### Team Parallel Strategy

1. Team completes Setup + Foundational together.
2. Then split by story:
   - Engineer A: US1
   - Engineer B: US2
   - Engineer C: US3
   - Engineer D: US4
3. Merge at story checkpoints with test gates.

## Notes

- `[P]` denotes tasks that can execute in parallel with no file conflicts.
- `[USx]` labels map each task to a user story for traceability.
- Every task includes a concrete file path.
- Do not auto-commit; keep changes for human review and manual commit.
