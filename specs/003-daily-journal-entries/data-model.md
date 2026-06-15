# Data Model: Daily Journal Entries

## Entity: RoutineDailyJournalEntry

- Purpose: Stores a routine-scoped optional text journal for one selected local calendar day.
- Primary identity: `id` (UUID)
- Natural uniqueness: `(routineId, dayKey)`

### Fields

- `id`: string
  - System-generated UUID.
- `routineId`: string
  - Foreign-key reference to `Routine.id`.
  - Required.
- `dayKey`: string (`YYYY-MM-DD`)
  - Local calendar-day key aligned with selected-date behavior.
  - Required.
- `text`: string
  - Optional user-authored note.
  - Length range: `0..2000` characters.
- `updatedAt`: string (ISO datetime)
  - Timestamp of last persisted mutation.
  - Required.
- `createdAt`: string (ISO datetime)
  - Timestamp of first creation.
  - Required.

## Relationships

- `Routine (1) -> RoutineDailyJournalEntry (many by day)`
- One `RoutineDailyJournalEntry` belongs to exactly one `Routine`.
- Each routine can have at most one journal entry per `dayKey`.

## Validation Rules

- `routineId` MUST reference an existing routine.
- `dayKey` MUST match local day-key format used by existing selected-date navigation.
- `text` MUST NOT exceed 2,000 characters.
- Empty `text` is valid and represents an intentionally blank/cleared journal for the day.
- Upsert semantics MUST update existing `(routineId, dayKey)` record instead of creating duplicates.

## State Transitions

- `Missing -> Created`
  - Trigger: first save on a routine/day.
- `Created -> Updated`
  - Trigger: subsequent auto-save for same routine/day.
- `Updated -> Updated (cleared)`
  - Trigger: user removes text and auto-save persists empty value.

## Query Patterns

- Load by routine/day: `(routineId, dayKey)` unique lookup.
- Upsert by routine/day: insert when absent; update when present.
- Isolation check: entries for one routine/day MUST not appear when viewing another routine.
