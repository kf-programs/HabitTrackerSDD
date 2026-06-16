# Data Model: Habit and Category Deletion

## Entity: Habit
- Source: src/db/schema.ts (HabitRecord)
- Key fields:
  - id: string
  - routineId: string
  - categoryId: string
  - title: string
  - timeframe: daily | weekly
  - trackingType: yesno | counter | measurement
  - status: active | archived | deleted
  - deletedAt?: string
  - createdAt: string
  - updatedAt: string
- Deletion semantics:
  - Habit deletion is a soft-delete by setting status=deleted and deletedAt.
  - Habit is hidden on/after deleted day from routine active view, but visible for historical days before deletion.
- Validation rules:
  - Deletion requires explicit user confirmation.
  - Failed persistence leaves habit visible and unchanged.

## Entity: Category
- Source: src/db/schema.ts (CategoryRecord)
- Key fields:
  - id: string
  - routineId: string
  - name: string
  - description?: string
  - orderIndex: number
  - isExpandedDefault: boolean
  - createdAt: string
  - updatedAt: string
- Deletion semantics:
  - Category deletion is routine-scoped to the currently open routine.
  - Category deletion hard-deletes the category record from the categories table for the current routine.
  - Category removal hides the category container from active routine view.
  - Habits under the deleted category are soft-deleted to preserve historical entries.
- Validation rules:
  - Deletion requires explicit user confirmation.
  - Failed persistence leaves category and habits visible/unchanged.

## Entity: Entry
- Source: src/db/schema.ts (EntryRecord)
- Role in this feature:
  - Historical evidence for habit completion and values.
- Preservation rules:
  - Entries are never deleted by habit/category deletion in this feature.
  - Historical entries remain queryable for past dates.

## Entity: Deletion Confirmation Dialog
- Source: src/components/modals/ConfirmationDialog.tsx
- Fields/props used:
  - isOpen, title, message, onConfirm, onCancel
  - optional confirmLabel and cancelLabel
- Behavioral rules:
  - Opens only after delete icon activation.
  - No data mutation before confirm action.
  - Cancel/dismiss leaves state unchanged.

## Relationships
- Routine 1..* Category (by Category.routineId)
- Category 1..* Habit (by Habit.categoryId)
- Habit 1..* Entry (by Entry.habitId)

## State Transitions

### Habit lifecycle (deletion path)
- active -> deleted (on confirmed habit delete)
- deleted visibility rule:
  - selectedDay < deletedDay: visible in historical view
  - selectedDay >= deletedDay: hidden in active routine view

### Category lifecycle (feature-level behavior)
- existing category -> category record hard-deleted from current routine (on confirmed category delete)
- dependent habits transition:
  - active/archived -> deleted (soft-delete)
- entry lifecycle:
  - unchanged (preserved)
