# Tasks: Habit Goal Completion Controls

**Input**: Design documents from [specs/004-habit-goal-completion](specs/004-habit-goal-completion)

**Prerequisites**: [plan.md](specs/004-habit-goal-completion/plan.md), [spec.md](specs/004-habit-goal-completion/spec.md), [research.md](specs/004-habit-goal-completion/research.md), [data-model.md](specs/004-habit-goal-completion/data-model.md), [contracts/habit-completion-ui-contract.md](specs/004-habit-goal-completion/contracts/habit-completion-ui-contract.md), [quickstart.md](specs/004-habit-goal-completion/quickstart.md)

**Tests**: Tests are mandatory for every user story and must be written first, fail first, then pass after implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare schema, migration scaffolding, and test files for counter-goal and yes/no toggle work.

- [X] T001 Add counter-goal fields to habit record typings in src/db/schema.ts
- [X] T002 Add Dexie schema version and migration path for new counter-goal fields in src/db/client.ts
- [X] T003 [P] Create repository test scaffold for counter-goal persistence in src/test/repositories/habitsRepository.counter-goal.test.ts
- [X] T004 [P] Create component test scaffold for counter-goal and yes/no toggle behaviors in src/test/components/HabitRow.counter-goal.test.tsx and src/test/components/HabitRow.yesno-toggle.test.tsx
- [X] T005 [P] Create integration test scaffold for routine flow updates in src/test/components/RoutineWorkspace.counter-goal.test.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core persistence and evaluation primitives needed by all user stories.

**Critical**: No user story work starts before this phase is complete.

- [X] T006 Implement habit repository create/update/read support for counterGoalOperator and counterGoalValue in src/repositories/habitsRepository.ts
- [X] T007 Implement integer-only guard for counter goal values in repository write paths in src/repositories/habitsRepository.ts
- [X] T008 [P] Implement counter completion evaluation helper for gt/lt/eq semantics in src/services/timelineService.ts
- [X] T009 [P] Implement legacy counter fallback rule (editable but not completable without condition) in src/services/timelineService.ts
- [X] T010 Wire foundational counter-goal data through routine loading pipeline in src/components/RoutineWorkspace.tsx

**Checkpoint**: Foundation ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Configure and Complete Counter Goals (Priority: P1)

**Goal**: Users can configure counter goal conditions and complete counter habits by setting values against those conditions.

**Independent Test**: Create counter habits for each operator, set integer values with Set, and verify completion reflects configured condition.

### Tests for User Story 1 (Mandatory)

- [X] T011 [P] [US1] Add repository test for saving and retrieving counter goal operator/value metadata in src/test/repositories/habitsRepository.counter-goal.test.ts
- [X] T012 [P] [US1] Add component test for counter goal setup validation and integer-only input in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T013 [P] [US1] Add component test for Set action evaluating gt/lt/eq completion correctly in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T014 [P] [US1] Add integration test for showing goal summary in routine habit view in src/test/components/RoutineWorkspace.counter-goal.test.tsx

### Implementation for User Story 1

- [X] T015 [US1] Add counter-goal setup inputs (operator + goal integer) in src/components/CategoryAccordion.tsx
- [X] T016 [US1] Extend routine create-habit flow to persist counter-goal config in src/components/RoutineWorkspace.tsx
- [X] T017 [US1] Implement counter goal summary rendering and Set action UI in src/components/HabitRow.tsx
- [X] T018 [US1] Implement Set action save path for counter values in src/components/RoutineWorkspace.tsx
- [X] T019 [US1] Ensure counter completion state derives from configured operator and goal in src/services/timelineService.ts

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Adjust Counter Values After Setting (Priority: P1)

**Goal**: Users can update previously set counter values and get immediate completion recalculation, including after condition changes.

**Independent Test**: Set a counter value, edit and set a new value, then modify goal/operator and verify completion recomputes immediately.

### Tests for User Story 2 (Mandatory)

- [X] T020 [P] [US2] Add component test for replacing existing counter value on repeated Set in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T021 [P] [US2] Add integration test for immediate completion recompute when goal/operator changes in src/test/components/RoutineWorkspace.counter-goal.test.tsx
- [X] T022 [P] [US2] Add repository test for rejecting decimal counter set values in src/test/repositories/entriesRepository.test.ts
- [X] T037 [P] [US2] Add integration test for editing an existing counter goal/operator from routine view and persisting updated condition in src/test/components/RoutineWorkspace.counter-goal.test.tsx

### Implementation for User Story 2

- [X] T023 [US2] Update counter value editing flow to always remain editable after Set in src/components/HabitRow.tsx
- [X] T024 [US2] Ensure counter Set writes replace prior period value in src/repositories/entriesRepository.ts
- [X] T025 [US2] Trigger immediate completion recomputation on counter condition updates in src/components/RoutineWorkspace.tsx
- [X] T026 [US2] Enforce integer-only counter value saves in UI and persistence boundaries in src/components/HabitRow.tsx and src/repositories/entriesRepository.ts
- [X] T038 [US2] Implement edit flow for existing counter goal/operator and persist updates via habit repository in src/components/HabitRow.tsx and src/components/RoutineWorkspace.tsx

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Toggle Yes/No Completion State (Priority: P2)

**Goal**: Daily and weekly yes/no habits can be toggled complete and incomplete with state-accurate labels.

**Independent Test**: Mark daily and weekly yes/no habits complete, then toggle both back to incomplete and verify labels update correctly.

### Tests for User Story 3 (Mandatory)

- [X] T027 [P] [US3] Add component test for daily label transitions Mark complete -> Mark incomplete -> Mark complete in src/test/components/HabitRow.yesno-toggle.test.tsx
- [X] T028 [P] [US3] Add component test for weekly label transitions Mark done this week -> Mark incomplete -> Mark done this week in src/test/components/HabitRow.yesno-toggle.test.tsx
- [X] T029 [P] [US3] Add integration test for reversible yes/no persistence in routine workflow in src/test/components/RoutineWorkspace.counter-goal.test.tsx

### Implementation for User Story 3

- [X] T030 [US3] Replace one-way weekly yes/no logic with reversible toggle behavior in src/components/HabitRow.tsx
- [X] T031 [US3] Apply finalized daily and weekly action labels in src/components/HabitRow.tsx
- [X] T032 [US3] Ensure yes/no toggle writes persist both completion and incompletion transitions in src/repositories/entriesRepository.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and validation across all stories.

- [X] T033 [P] Add regression test for legacy counter habits without condition remaining editable but not completable in src/test/components/RoutineWorkspace.counter-goal.test.tsx
- [X] T034 [P] Update quickstart with final validation commands and observed behavior in specs/004-habit-goal-completion/quickstart.md
- [X] T035 Run targeted feature test suites for counter goals and yes/no toggles in src/test/components/HabitRow.counter-goal.test.tsx, src/test/components/HabitRow.yesno-toggle.test.tsx, src/test/components/RoutineWorkspace.counter-goal.test.tsx, and src/test/repositories/habitsRepository.counter-goal.test.ts
- [X] T036 Run full project lint and test gates via npm run lint and npm run test

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup and blocks all user stories.
- User Story phases (Phase 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of selected user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational; no dependency on other stories.
- US2 (P1): starts after Foundational; depends on US1 counter Set path but remains independently testable for value editing and recomputation.
- US3 (P2): starts after Foundational; functionally independent from counter-goal stories except shared entry persistence.

### Within Each User Story

- Tests first and failing before implementation.
- Repository/service changes before UI integration where applicable.
- Core interaction flow before polish and final validation.

### Parallel Opportunities

- Setup: T003, T004, T005 can run in parallel after T001-T002.
- Foundational: T008 and T009 can run in parallel with T006-T007.
- US1: T011-T014 can run in parallel; T015 and T017 can run in parallel once foundational data paths are ready.
- US2: T020-T022 and T037 can run in parallel.
- US3: T027-T029 can run in parallel.
- Polish: T033 and T034 can run in parallel before gate runs.

---

## Parallel Example: User Story 1

- Run in parallel: T011, T012, T013, T014
- Run in parallel after tests are in place: T015 and T017

## Parallel Example: User Story 2

- Run in parallel: T020, T021, T022, T037

## Parallel Example: User Story 3

- Run in parallel: T027, T028, T029

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently with T011-T014 and quickstart checks.
4. Demo/deploy MVP slice.

### Incremental Delivery

1. Deliver US1 (counter goal setup + Set-based completion).
2. Deliver US2 (counter value edit + recompute behavior).
3. Deliver US3 (reversible yes/no completion labels and behavior).
4. Finish cross-cutting polish and full lint/test gates.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After foundation:
   - Engineer A: US1 implementation and tests.
   - Engineer B: US2 value-edit and recompute tests/implementation.
   - Engineer C: US3 toggle and label behavior tests/implementation.
3. Merge after independent story checkpoints pass.

---

## Phase 7: Bug Fixes — Counter UI and Timeline Completion

**Context**: Three post-implementation bugs were identified that require targeted fixes.

- **BF-001** Counter habits have no Unset path: once Set, the value is locked with no way to undo completion.
- **BF-002** The ± increment/decrement buttons were unintentionally removed from the counter UI.
- **BF-003** The daily grid cell still shows as completed when a counter goal condition is no longer met because `buildDailyTimeline` uses `isCompletedEntry` (integer > 0) instead of `evaluateCounterCompletion`.

---

### BF-001: Counter Set / Unset Toggle

**Goal**: Users can click "Set" to lock a counter value and evaluate completion, and click "Unset" to delete the entry and undo completion—mirroring yes/no "Mark incomplete" semantics.

**Independent Test**: Render a counter habit, click Set, verify input locked and "Unset" button appears; click Unset, verify entry deleted, input editable, and completion cleared.

#### Tests for BF-001 (Mandatory)

- [X] T039 [P] [BF1] Add test for Set locking input and showing Unset button in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T040 [P] [BF1] Add test for Unset clearing completed state and unlocking input in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T041 [P] [BF1] Add integration test for Unset deleting the entry in routine context in src/test/components/RoutineWorkspace.counter-goal.test.tsx

#### Implementation for BF-001

- [X] T042 [BF1] Add deleteEntryForHabitPeriod function to src/repositories/entriesRepository.ts
- [X] T043 [BF1] Add hasEntry and onClearEntry props to HabitRow and implement Set/Unset state: lock input on Set, call onClearEntry and clear completion on Unset in src/components/HabitRow.tsx
- [X] T044 [BF1] Pass hasEntry and handleClearEntry from RoutineWorkspace to HabitRow; implement handleClearEntry using deleteEntryForHabitPeriod in src/components/RoutineWorkspace.tsx

---

### BF-002: Restore Counter Increment / Decrement Buttons

**Goal**: The − and + arrow buttons that allow step-wise counter adjustment are restored and only active when the habit is in the Unset (editable) state.

**Independent Test**: Render a counter habit in unset state, click + twice and − once, verify counterDraft and onSave calls reflect the net change; verify buttons are absent when habit is in Set state.

#### Tests for BF-002 (Mandatory)

- [X] T045 [P] [BF2] Add test for + and − buttons incrementing and decrementing counter draft in src/test/components/HabitRow.counter-goal.test.tsx
- [X] T046 [P] [BF2] Add test that arrow buttons are not rendered when habit is in Set state in src/test/components/HabitRow.counter-goal.test.tsx

#### Implementation for BF-002

- [X] T047 [BF2] Restore − and + step buttons in counter UI alongside the numeric input; hide them when isSet is true in src/components/HabitRow.tsx

---

### BF-003: Daily Grid Uses Counter Goal Evaluation

**Goal**: The daily timeline tile for a period reflects completion only when the counter entry's value satisfies the configured goal condition, not merely when intValue > 0.

**Independent Test**: Build a daily timeline with a counter habit whose set value does not meet the goal; verify the tile is marked not completed. Repeat with a passing value; verify completed.

#### Tests for BF-003 (Mandatory)

- [X] T048 [P] [BF3] Add test: buildDailyTimeline returns not-completed for counter entry that does not satisfy goal condition in src/test/services/timelineService.test.ts
- [X] T049 [P] [BF3] Add test: buildDailyTimeline returns completed for counter entry that satisfies goal condition in src/test/services/timelineService.test.ts
- [X] T050 [P] [BF3] Add test: buildWeeklyTimeline applies counter goal evaluation symmetrically in src/test/services/timelineService.test.ts

#### Implementation for BF-003

- [X] T051 [BF3] Update buildDailyTimeline in src/services/timelineService.ts to use evaluateCounterCompletion for counter habits: build a habitId→HabitRecord map and use it per-entry instead of isCompletedEntry
- [X] T052 [BF3] Update buildWeeklyTimeline in src/services/timelineService.ts with the same counter-aware evaluation

---

### Phase 7 Validation

- [X] T053 [P] Run focused bug fix test files: src/test/components/HabitRow.counter-goal.test.tsx, src/test/components/RoutineWorkspace.counter-goal.test.tsx, src/test/services/timelineService.test.ts
- [X] T054 Run full project lint and test gates via npm run lint and npm run test

---

## Phase 7 Dependencies

- T039–T041 (BF-001 tests) can run in parallel before T042–T044.
- T042 (deleteEntryForHabitPeriod) must complete before T043–T044.
- T043 (HabitRow Set/Unset) must complete before T044 (RoutineWorkspace wiring).
- T045–T046 (BF-002 tests) can run in parallel; T047 implements.
- T048–T050 (BF-003 tests) can run in parallel; T051–T052 implement.
- T053–T054 run last after all BF implementation tasks complete.