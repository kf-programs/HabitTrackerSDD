# Tasks: Habit and Category Deletion

**Input**: Design documents from /specs/005-habit-category-deletion/

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/deletion-workspace-contract.md, quickstart.md

**Tests**: Tests are mandatory for this feature (Vitest + React Testing Library + repository tests).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared fixtures and test harness updates used by all deletion stories.

- [X] T001 Add reusable routine/category/habit deletion fixture builders in src/test/utils.ts
- [X] T002 Create deletion-focused repository test file scaffold in src/test/repositories/categoriesRepository.delete.test.ts
- [X] T003 [P] Create deletion-focused workspace component test file scaffold in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T004 [P] Create deletion-focused category UI test file scaffold in src/test/components/CategoryAccordion.deletion.test.tsx
- [X] T005 [P] Create deletion-focused habit UI test file scaffold in src/test/components/HabitRow.deletion.test.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared deletion primitives required by all user stories.

**CRITICAL**: User story implementation starts only after this phase is complete.

- [X] T006 Implement routine-scoped category deletion transaction API in src/repositories/categoriesRepository.ts
- [X] T007 [P] Add repository tests for routine-scoped category deletion and cross-routine isolation in src/test/repositories/categoriesRepository.delete.test.ts
- [X] T008 Add shared deletion target/dialog state model for routine workspace in src/components/RoutineWorkspace.tsx
- [X] T009 [P] Add shared deletion error notification state and rendering path in src/components/RoutineWorkspace.tsx
- [X] T010 Add integration wiring from workspace to repository delete APIs in src/components/RoutineWorkspace.tsx

**Checkpoint**: Foundational deletion infrastructure is complete and story work can proceed.

---

## Phase 3: User Story 1 - Delete Habit From Routine (Priority: P1) 🎯 MVP

**Goal**: Users can delete a habit from the current routine via a trash icon beside Edit, with confirm/cancel behavior.

**Independent Test**: In routine workspace, habit row shows Edit then Trash, confirm removes only selected habit from active view, cancel keeps habit unchanged.

### Tests for User Story 1 (MANDATORY)

- [X] T011 [P] [US1] Add test for habit trash icon placement to the right of Edit in src/test/components/HabitRow.deletion.test.tsx
- [X] T012 [P] [US1] Add test for opening habit deletion confirmation dialog from workspace flow in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T013 [P] [US1] Add test for canceling habit deletion preserving habit visibility in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T014 [P] [US1] Add test for confirming habit deletion removing only targeted habit in src/test/components/RoutineWorkspace.deletion.test.tsx

### Implementation for User Story 1

- [X] T015 [US1] Add habit delete callback and aria-labeled trash control in src/components/HabitRow.tsx
- [X] T016 [US1] Handle habit delete intent selection and dialog open in src/components/RoutineWorkspace.tsx
- [X] T017 [US1] Execute confirmed habit soft-delete with existing repository API in src/components/RoutineWorkspace.tsx
- [X] T018 [US1] Keep habit unchanged on cancel and close dialog cleanly in src/components/RoutineWorkspace.tsx

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Delete Category From Routine (Priority: P1)

**Goal**: Users can delete a category from the current routine via a trash icon beside Edit, and remove only current-routine content.

**Independent Test**: In routine workspace, category header shows Edit then Trash, confirm removes selected category in current routine only, cancel keeps category unchanged.

### Tests for User Story 2 (MANDATORY)

- [X] T019 [P] [US2] Add test for category trash icon placement to the right of Edit in src/test/components/CategoryAccordion.deletion.test.tsx
- [X] T020 [P] [US2] Add test for opening category deletion confirmation dialog in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T021 [P] [US2] Add test for canceling category deletion preserving category and habits in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T022 [P] [US2] Add test for confirming category deletion removing category in current routine only in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T023 [P] [US2] Add repository test verifying category deletion soft-deletes only same-routine habits in src/test/repositories/categoriesRepository.delete.test.ts

### Implementation for User Story 2

- [X] T024 [US2] Add category delete callback and aria-labeled trash control in src/components/CategoryAccordion.tsx
- [X] T025 [US2] Wire category delete intent from accordion to workspace in src/components/RoutineWorkspace.tsx
- [X] T026 [US2] Execute category deletion via repository transaction and refresh workspace state in src/components/RoutineWorkspace.tsx
- [X] T027 [US2] Ensure category delete does not mutate similarly named categories/habits in other routines in src/repositories/categoriesRepository.ts

**Checkpoint**: User Stories 1 and 2 are independently functional and testable.

---

## Phase 5: User Story 3 - Confirm Before Destructive Actions (Priority: P2)

**Goal**: Habit and category deletion confirmations match routine deletion interaction pattern and preserve data on failure.

**Independent Test**: Dialog copy/actions appear before data mutation, confirm applies target-specific deletion, cancel/failure preserves visibility with error notice.

### Tests for User Story 3 (MANDATORY)

- [X] T028 [P] [US3] Add test asserting habit and category dialogs use routine-delete-style action labels and role=dialog in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T029 [P] [US3] Add test asserting no mutation occurs before confirm click in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T030 [P] [US3] Add test for persistence failure path keeping item visible and showing error notification in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T031 [P] [US3] Add historical preservation test for deleted habit/category visibility on past day in src/test/components/RoutineWorkspace.deletion.test.tsx

### Implementation for User Story 3

- [X] T032 [US3] Reuse ConfirmationDialog with entity-specific title/message for habit and category delete in src/components/RoutineWorkspace.tsx
- [X] T033 [US3] Add guarded confirm handlers preventing duplicate destructive operations on repeated clicks in src/components/RoutineWorkspace.tsx
- [X] T034 [US3] Surface repository delete failures through workspace error notification and preserve entity visibility in src/components/RoutineWorkspace.tsx
- [X] T035 [US3] Ensure historical entries remain available by retaining soft-delete query behavior in src/repositories/habitsRepository.ts

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and quality gates across stories.

- [X] T036 [P] Add regression assertions for dialog accessibility labels in src/test/components/modals/ConfirmationDialog.test.tsx
- [X] T037 [P] Add concise comments for non-obvious delete-state transitions in src/components/RoutineWorkspace.tsx
- [X] T038 Run feature quickstart verification checklist updates in specs/005-habit-category-deletion/quickstart.md
- [X] T039 Run lint gate and resolve violations for touched files using npm run lint against eslint.config.js
- [X] T040 Run targeted and full test gates for deletion feature using npm run test -- --run from package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): Starts immediately.
- Foundational (Phase 2): Depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3 onward): Depend on Foundational completion.
- Polish (Phase 6): Depends on completion of all targeted user stories.

### User Story Dependencies

- US1 (P1): Starts after Phase 2; no dependency on US2/US3.
- US2 (P1): Starts after Phase 2; uses foundational deletion primitives but remains independently testable.
- US3 (P2): Starts after US1 and US2 delete controls exist.

### Within Each User Story

- Tests first and failing before implementation.
- UI control wiring before confirm handler implementation.
- Confirm/cancel behavior before failure and historical validation.

## Parallel Opportunities

- Phase 1: T003, T004, T005 can run in parallel.
- Phase 2: T007 and T009 can run in parallel after T006/T008 scaffolding.
- US1: T011-T014 can run in parallel.
- US2: T019-T023 can run in parallel.
- US3: T028-T031 can run in parallel.
- Polish: T036 and T037 can run in parallel.

## Parallel Example: User Story 1

- [X] T011 [P] [US1] Add test for habit trash icon placement to the right of Edit in src/test/components/HabitRow.deletion.test.tsx
- [X] T012 [P] [US1] Add test for opening habit deletion confirmation dialog from workspace flow in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T013 [P] [US1] Add test for canceling habit deletion preserving habit visibility in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T014 [P] [US1] Add test for confirming habit deletion removing only targeted habit in src/test/components/RoutineWorkspace.deletion.test.tsx

## Parallel Example: User Story 2

- [X] T019 [P] [US2] Add test for category trash icon placement to the right of Edit in src/test/components/CategoryAccordion.deletion.test.tsx
- [X] T020 [P] [US2] Add test for opening category deletion confirmation dialog in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T023 [P] [US2] Add repository test verifying category deletion soft-deletes only same-routine habits in src/test/repositories/categoriesRepository.delete.test.ts

## Parallel Example: User Story 3

- [X] T028 [P] [US3] Add test asserting habit and category dialogs use routine-delete-style action labels and role=dialog in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T030 [P] [US3] Add test for persistence failure path keeping item visible and showing error notification in src/test/components/RoutineWorkspace.deletion.test.tsx
- [X] T031 [P] [US3] Add historical preservation test for deleted habit/category visibility on past day in src/test/components/RoutineWorkspace.deletion.test.tsx

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete US1 (T011-T018).
3. Validate US1 independently with its tests.
4. Demo/deploy MVP behavior.

### Incremental Delivery

1. Deliver US1 deletion controls and confirmation.
2. Deliver US2 category deletion scope and repository safety.
3. Deliver US3 confirmation parity, failure handling, and historical-preservation checks.
4. Finish with Phase 6 lint/test gates.

### Team Parallel Strategy

1. One developer handles repository foundational tasks (T006-T007).
2. One developer handles habit UI/test stream (US1).
3. One developer handles category UI/test stream (US2).
4. Integrate US3 confirmation and reliability checks once controls are merged.
