# Contract: Routine Daily Journal Entry

## Purpose

Define read/write behavior for daily routine journal entries so UI and persistence remain consistent.

## Storage Contract

- Store journal entries in a dedicated routine journal collection/table.
- Enforce unique identity by composite key `(routineId, dayKey)`.
- Persist local day-key format `YYYY-MM-DD` matching selected-date behavior.
- Persist fields:
  - `id`
  - `routineId`
  - `dayKey`
  - `text` (0..2000 chars)
  - `createdAt`
  - `updatedAt`

## Read Contract

### `getRoutineJournalEntry(routineId, dayKey)`

Input:
- `routineId`: string (required)
- `dayKey`: string (required)

Output:
- Returns journal entry for exact routine/day if present.
- Returns `undefined` if no entry exists.

Behavior guarantees:
- Must not return entries from other routines or other days.

## Write Contract

### `upsertRoutineJournalEntry({ routineId, dayKey, text })`

Input:
- `routineId`: string (required)
- `dayKey`: string (required)
- `text`: string (required, max 2000; empty string allowed)

Output:
- Returns stored/updated entry.

Behavior guarantees:
- Creates a new entry when `(routineId, dayKey)` is absent.
- Updates existing entry when `(routineId, dayKey)` exists.
- Must never create duplicate records for same routine/day.
- Must update `updatedAt` on every mutation.
- Must preserve original `createdAt` after first insert.

## UI Trigger Contract

- UI must call upsert when:
  - typing pause debounce fires (600 ms),
  - textarea blur occurs,
  - selected date changes with unsaved edits.
- UI must cap input at 2,000 characters before persistence.

## Failure Contract

- On local storage quota or availability failure, repository returns a typed/handled error message.
- UI should preserve user input in memory until the user retries or navigates away.
