# Research: Historical Navigation and Backdating

## Decision 1: Daily State Uses Habit-Date Identity
- Decision: Treat each habit-day combination as one mutable state record keyed by habit identifier and normalized day.
- Rationale: Enforces idempotent behavior and prevents duplicate history rows during repeated toggles or value edits.
- Alternatives considered:
  - Append-only event logs: rejected because read/merge complexity increases and duplicates are easier to create.
  - Per-interaction snapshots: rejected due to noisy storage and poor checklist semantics.

## Decision 2: Soft Delete at Habit Definition Level
- Decision: Keep habit definitions and daily records in storage when a habit is deleted from active use; mark deletion lifecycle metadata instead.
- Rationale: Preserves historical continuity and allows date-accurate checklist reconstruction.
- Alternatives considered:
  - Hard-delete habit and daily records: rejected because it destroys historical evidence.
  - Archive table migration on deletion: rejected as unnecessary complexity for local-first scope.

## Decision 3: Composite Uniqueness for Data Integrity
- Decision: Enforce uniqueness on habit identifier plus log date for daily records using Dexie index strategy and repository safeguards.
- Rationale: Guarantees exactly one row for a habit/day even under repeated updates.
- Alternatives considered:
  - App-level best effort checks only: rejected as race-prone and easier to regress.
  - UUID-only records with dedupe sweeps: rejected because corrective cleanup is late and lossy.

## Decision 4: Idempotent Upsert Save Path
- Decision: Implement save/log as lookup-by habit/date, update-if-exists, create-if-missing.
- Rationale: Mirrors business rule for single daily state and keeps UI operations deterministic.
- Alternatives considered:
  - Delete then insert each write: rejected due to unnecessary churn and audit confusion.
  - Blind insert with conflict handling later: rejected due to avoidable failures and complexity.

## Decision 5: Date-Aware Habit Visibility Query
- Decision: For a selected date, fetch habits valid on that day (active or deleted after selected day), fetch same-day records, and merge by habit id.
- Rationale: Ensures past views show historically active habits while current/future views hide deleted habits.
- Alternatives considered:
  - Render only currently active habits: rejected because historical views become inaccurate.
  - Render all habits regardless of lifecycle: rejected because post-deletion dates become cluttered.

## Decision 6: Historical Type-Mismatch Fallback
- Decision: If a historical record value is incompatible with current tracking type, render as checkbox-complete and hide counter display.
- Rationale: Keeps the day usable, avoids crashes, and provides deterministic UX for legacy data.
- Alternatives considered:
  - Default numeric value of 1: rejected because it can imply fabricated measured progress.
  - Force user repair flow before render: rejected because it blocks routine review.
