# Contract: Selected-Date Checklist Read/Merge

## Scope
- Operation: Build checklist rows for one selected calendar day.

## Inputs
- selectedDate: string (YYYY-MM-DD)

## Read Steps
1. Fetch HabitDefinition rows valid for selectedDate:
   - deletedAt is null, OR
   - deletedAt is after selectedDate boundary.
2. Fetch HabitDailyRecord rows with logDate = selectedDate.
3. Merge by habitId and project checklist item state.

## Output Contract
- habitId: string
- title: string
- trackingType: yesno | counter | measurement
- hasRecord: boolean
- completed: boolean
- numericValue: number | null
- fallbackApplied: boolean

## Rendering Rules
- If record exists and type-compatible: render using stored values.
- If record missing: render empty/incomplete state.
- If record exists but type-mismatched: render checkbox-complete, hide numeric value, set fallbackApplied=true.

## Guarantees
- Past date views include habits that were valid on that date even if deleted later.
- Current/future views exclude deleted habits.
