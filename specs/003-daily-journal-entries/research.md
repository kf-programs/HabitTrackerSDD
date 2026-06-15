# Research: Daily Journal Entries

## Decision 1: Persist journals in a dedicated Dexie table keyed by routine and day
- Decision: Add a new `routineJournalEntries` table with unique composite index `&[routineId+dayKey]` and store one optional text entry per routine-day.
- Rationale: Journal entries are routine-scoped content, not habit entries; a dedicated table cleanly enforces one-record-per-day semantics and avoids overloading existing habit entry records.
- Alternatives considered: Reuse `entries` table (rejected: schema semantics tied to habitId/valueType); embed on routine record (rejected: poor scalability and date-query complexity).

## Decision 2: Auto-save behavior should debounce while typing and flush on blur/date change
- Decision: Save after a short typing pause and force-save on textarea blur or selected-date switch.
- Rationale: Matches clarified UX, minimizes accidental data loss, and keeps interaction lightweight without requiring explicit save clicks.
- Alternatives considered: Save button only (rejected: slower, easier to forget); save every keystroke (rejected: unnecessary write volume and jitter risk).

## Decision 3: Use existing local day-key semantics for journal storage
- Decision: Journal day mapping follows existing `getDayKey`/selected-date local calendar-day behavior.
- Rationale: Ensures consistency with current timeline/checklist navigation and avoids split-brain date behavior.
- Alternatives considered: UTC day keys (rejected: mismatch with visible selected date); routine-specific timezone setting (rejected: out of scope and added complexity).

## Decision 4: Enforce 2,000-character input limit at UI and persistence boundary
- Decision: Constrain journal text to 2,000 characters and preserve empty string as valid state.
- Rationale: Satisfies clarified requirement and keeps storage predictable while preserving optional journaling.
- Alternatives considered: 500-char limit (rejected: too restrictive for reflective notes); 10,000-char limit (rejected: unnecessary scope/performance risk for MVP).

## Decision 5: Validate with repository and workspace integration tests
- Decision: Add repository tests for upsert/scoping and component tests for date-switch loading + auto-save.
- Rationale: Feature risk is state correctness across date/routine transitions; these tests directly cover persistence and interaction paths.
- Alternatives considered: Manual validation only (rejected: insufficient regression protection); service-only tests (rejected: misses UI trigger behavior).
