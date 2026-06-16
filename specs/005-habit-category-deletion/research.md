# Research: Habit and Category Deletion

## Decision 1: Use existing modal confirmation component for habit/category deletion
- Decision: Reuse the existing ConfirmationDialog component and interaction pattern already used for routine deletion.
- Rationale: Keeps user interaction consistent with current destructive-action UX and reuses established accessibility and test conventions.
- Alternatives considered:
  - Build dedicated delete modals per entity (rejected: duplicated behavior and styling)
  - Use browser native confirm() (rejected: inconsistent UI and weaker testability)

## Decision 2: Preserve historical entries via soft-delete semantics
- Decision: Deleting a habit/category from routine workspace removes current routine visibility only, while preserving historical entries for past dates.
- Rationale: Matches clarified product requirement and existing habit soft-delete lifecycle behavior in repository tests.
- Alternatives considered:
  - Hard-delete related entries (rejected: destructive data loss)
  - Full restore-capable recycle bin (rejected: out of current feature scope)

## Decision 3: Scope deletion to current routine only
- Decision: Category and habit deletion operate only within the active routine and do not cascade across other routines.
- Rationale: Routine workspace actions must be local to the route context and avoid cross-routine side effects.
- Alternatives considered:
  - Global deletion by matching names (rejected: unsafe and ambiguous)
  - Prevent non-empty category deletion (rejected: conflicts with requested category delete behavior)

## Decision 4: Failure handling is non-destructive
- Decision: On persistence failure, keep item visible and show an error notification; do not apply deletion in UI state.
- Rationale: Prevents UI/data divergence and supports reliable retry behavior.
- Alternatives considered:
  - Optimistic remove then rollback (rejected: higher complexity and flicker risk)
  - Queue deferred delete for eventual sync (rejected: out of scope for local workflow)

## Decision 5: Repository approach for category deletion
- Decision: Implement category deletion in categories repository with routine-scoped transaction and habit soft-delete behavior.
- Rationale: Aligns with current repository ownership and keeps consistency with existing data access patterns.
- Alternatives considered:
  - Perform ad-hoc Dexie writes in component layer (rejected: breaks repository boundary)
  - Hard-delete category and habit rows directly (rejected: violates historical-preservation requirement)
