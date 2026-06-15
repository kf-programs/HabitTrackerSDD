# Contract: Habit Completion UI Behavior

## Scope
Defines user-facing input/output behavior for:
- Counter habit goal setup and completion interactions
- Daily and weekly yes/no reversible completion controls

## 1. Counter habit setup contract

### Input fields
- `trackingType = counter`
- `goalOperator` selection options:
  - `Greater than`
  - `Less than`
  - `Equal to`
- `goalValue` input:
  - Integer-only input

### Validation behavior
- If `goalValue` is empty or non-integer, habit condition is invalid.
- Invalid condition must block completion capability for that counter habit.
- Existing valid user input in other fields remains intact when validation fails.

### Display behavior in routine view
- Counter habits display configured condition summary near the habit, for example:
  - `Goal: > 8`
  - `Goal: < 5`
  - `Goal: = 10`

## 2. Counter value set contract

### Controls
- Editable numeric input for counter value
- `Set` action button

### Save behavior
- Pressing `Set` persists the integer value for active period context.
- Repeated `Set` replaces prior value for same habit and period.

### Completion evaluation
- Evaluate immediately after `Set`:
  - `gt`: complete if `value > goal`
  - `lt`: complete if `value < goal`
  - `eq`: complete if `value === goal`
- If condition is missing, value may be edited but completion remains false.

### Condition-change behavior
- When goal/operator changes, completion state recomputes immediately from current set value.

## 3. Yes/No toggle contract

### Daily yes/no labels
- Incomplete state label: `Mark complete`
- Complete state label: `Mark incomplete`

### Weekly yes/no labels
- Incomplete state label: `Mark done this week`
- Complete state label: `Mark incomplete`

### Toggle behavior
- Control remains clickable in both states.
- Activating control flips completion state and persists it for the active period context.

## 4. Legacy counter compatibility contract

### Legacy scenario
- Counter habits may exist without configured goal/operator.

### Required behavior
- Habit remains visible and editable.
- Completion must not become true until a valid condition is configured.
- User can configure condition later without data loss.

## 5. Test contract coverage expectations
- Counter setup validation covers integer-only enforcement and operator selection.
- Counter set/edit flow verifies value replacement and completion recomputation.
- Condition-change flow verifies immediate recomputation.
- Daily and weekly yes/no flows verify two-way toggling and label transitions.
- Legacy counter flow verifies editable-but-not-completable behavior until configuration.