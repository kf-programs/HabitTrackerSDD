# Data Model: Habit Goal Completion Controls

## Entity: HabitRecord (extended)
- Purpose: Defines stable habit configuration used across routine rendering and entry evaluation.
- Existing fields used:
  - `id: string`
  - `routineId: string`
  - `categoryId: string`
  - `title: string`
  - `timeframe: 'daily' | 'weekly'`
  - `trackingType: 'yesno' | 'counter' | 'measurement'`
  - `status: 'active' | 'archived' | 'deleted'`
- New fields for counter habits:
  - `counterGoalOperator?: 'gt' | 'lt' | 'eq'`
  - `counterGoalValue?: number` (integer only)
- Validation rules:
  - Counter habits require both goal operator and goal value before they can become complete.
  - Goal value must be an integer.
  - Non-counter habits must ignore counter goal fields.
- Relationships:
  - One `HabitRecord` has many `EntryRecord` values across periods.

## Entity: EntryRecord (existing)
- Purpose: Stores period-specific user-entered completion values.
- Existing counter-relevant fields:
  - `habitId: string`
  - `periodKey: string`
  - `timeframe: 'daily' | 'weekly'`
  - `valueType: 'integer' | 'boolean' | 'string'`
  - `intValue?: number`
- Validation rules:
  - Counter set action writes integer `intValue` with `valueType='integer'`.
  - Yes/No toggle writes `boolValue` with `valueType='boolean'` for both daily and weekly contexts.
- Relationships:
  - Many entries map to one habit.

## Derived View Model: CounterCompletionState
- Purpose: Runtime evaluation payload for rendering counter status.
- Fields:
  - `currentValue: number | null`
  - `goalOperator: 'gt' | 'lt' | 'eq' | null`
  - `goalValue: number | null`
  - `isConditionConfigured: boolean`
  - `isCompleted: boolean`
- Evaluation rules:
  - If condition not configured, `isCompleted=false`.
  - `gt`: `currentValue > goalValue`
  - `lt`: `currentValue < goalValue`
  - `eq`: `currentValue === goalValue`

## Derived View Model: YesNoToggleState
- Purpose: Determines label and toggle behavior by timeframe and completion status.
- Fields:
  - `timeframe: 'daily' | 'weekly'`
  - `isCompleted: boolean`
  - `actionLabel: string`
- Label rules:
  - Daily incomplete: `Mark complete`
  - Daily complete: `Mark incomplete`
  - Weekly incomplete: `Mark done this week`
  - Weekly complete: `Mark incomplete`

## State Transitions

### Counter habit configuration
- Initial: counter habit without condition (legacy or newly created before setup completion)
- Transition: user sets goal operator + integer goal value
- Result: condition-configured state enabled for completion evaluation

### Counter completion lifecycle
- Initial: `currentValue` absent or non-completing
- Transition A: user enters integer and presses `Set`
- Result A: value persisted for period; completion evaluated true/false
- Transition B: user edits value and presses `Set` again
- Result B: existing period value replaced; completion re-evaluated
- Transition C: user changes goal or operator
- Result C: completion re-evaluated immediately against current value

### Yes/No toggle lifecycle
- Initial: incomplete
- Transition A: user marks complete
- Result A: entry persisted as complete; label switches to `Mark incomplete`
- Transition B: user marks incomplete
- Result B: entry persisted as incomplete; label returns to timeframe-specific completion action