# Data Model: Historical Navigation and Backdating

## Entity: HabitDefinition
- Purpose:
  - Canonical habit blueprint used across all dates.
- Fields:
  - id: string (stable identifier)
  - routineId: string
  - categoryId: string
  - title: string
  - trackingType: enum (yesno, counter, measurement)
  - measurementUnit: string | null
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
  - deletedAt: string | null
- Validation rules:
  - id required and immutable
  - title required and non-empty
  - deletedAt null means active
- Lifecycle notes:
  - Soft delete sets deletedAt; records are not removed.

## Entity: HabitDailyRecord
- Purpose:
  - Single mutable state for one habit on one normalized calendar day.
- Fields:
  - id: string (derived or generated)
  - habitId: string (fk -> HabitDefinition.id)
  - logDate: string (YYYY-MM-DD normalized local day)
  - completed: boolean | null
  - numericValue: number | null
  - textValue: string | null
  - updatedAt: string (ISO timestamp)
- Integrity constraints:
  - Composite uniqueness: (habitId, logDate)
  - At most one state payload is considered canonical per record write
- Validation rules:
  - habitId required
  - logDate required and normalized

## Entity: SelectedDateChecklistItem (Read Model)
- Purpose:
  - Merged output used to render checklist row for selected date.
- Fields:
  - habitId: string
  - title: string
  - trackingType: enum
  - isHabitVisibleForDate: boolean
  - hasRecord: boolean
  - completed: boolean
  - numericValue: number | null
  - fallbackApplied: boolean
  - fallbackReason: string | null
- Derivation rules:
  - Habit is visible if deletedAt is null OR deletedAt > selectedDate end boundary.
  - hasRecord true when HabitDailyRecord exists for same habitId + selectedDate.
  - On type mismatch, completed=true, numericValue=null, fallbackApplied=true.

## Relationship Rules
- HabitDefinition 1 -> many HabitDailyRecord by habitId.
- SelectedDateChecklistItem is a projection of HabitDefinition and HabitDailyRecord for one selected date.

## State Transitions
1. Save/Log interaction:
   - Input: habitId + selectedDate + new values.
   - If HabitDailyRecord exists for (habitId, selectedDate), update in place.
   - Else create new record with same key pair.
2. Habit deletion:
   - Set HabitDefinition.deletedAt to current timestamp.
   - Historical HabitDailyRecord rows remain unchanged.
3. Historical read:
   - Resolve date-valid habits, join same-date records, then project UI state.
