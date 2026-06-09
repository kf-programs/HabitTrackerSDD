# Data Model: Mindful Routine Tracker

## Entity: Routine
- Fields:
  - id: string (uuid)
  - title: string (required, 1..120 chars)
  - description: string (optional, max 1000 chars)
  - status: enum (`active`, `paused`)
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
  - lastAccessedAt: string (ISO timestamp)
- Relationships:
  - has many Category
- Validation rules:
  - title is required
  - status defaults to `active`

## Entity: Category
- Fields:
  - id: string (uuid)
  - routineId: string (fk -> Routine.id)
  - name: string (required, 1..80 chars)
  - orderIndex: number (integer >= 0)
  - isExpandedDefault: boolean
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Relationships:
  - belongs to Routine
  - has many Habit
- Validation rules:
  - category name required within a routine

## Entity: Habit
- Fields:
  - id: string (uuid)
  - routineId: string (fk)
  - categoryId: string (fk)
  - title: string (required, 1..120 chars)
  - timeframe: enum (`daily`, `weekly`)
  - trackingType: enum (`yesno`, `counter`, `measurement`)
  - measurementUnit: string (optional, max 24 chars)
  - status: enum (`active`, `archived`, `deleted`)
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Relationships:
  - belongs to Category and Routine
  - has many HabitEntry
- Validation rules:
  - timeframe and trackingType required

## Entity: HabitEntry
- Fields:
  - id: string (uuid)
  - habitId: string (fk -> Habit.id)
  - timeframe: enum (`daily`, `weekly`)
  - periodKey: string (e.g., `2026-06-09` for daily, `2026-W24-SUN` for weekly)
  - valueType: enum (`boolean`, `integer`, `string`)
  - boolValue: boolean (nullable)
  - intValue: number (nullable)
  - textValue: string (nullable)
  - recordedAt: string (ISO timestamp)
  - source: enum (`user`, `import`)
- Relationships:
  - belongs to Habit
- Validation rules:
  - exactly one value field set by valueType
- State transitions:
  - yes/no daily: incomplete -> complete
  - yes/no weekly: first completion locks week complete
  - counter: value can increment/decrement within bounds
  - measurement: saved on blur/keyboard dismissal

## Entity: TimelineTile
- Fields:
  - id: string (uuid)
  - routineId: string (fk)
  - timeframe: enum (`daily`, `weekly`)
  - periodKey: string
  - completed: boolean
  - pastelToken: string (palette key)
  - generatedAt: string (ISO timestamp)
  - sourceEntryIds: string[]
- Purpose:
  - preserves historical visual outcomes even when habits change
- Validation rules:
  - pastelToken must map to approved palette set

## Entity: SharePayload
- Fields:
  - version: string
  - routine: object (title, description, status)
  - categories: array
  - habits: array
- Exclusions:
  - MUST NOT include HabitEntry or TimelineTile historical records
- Validation rules:
  - payload must be schema-valid before import preview
