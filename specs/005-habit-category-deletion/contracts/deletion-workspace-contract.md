# Contract: Routine Workspace Deletion Interactions

## Scope
This contract defines UI interaction and persistence expectations for habit and category deletion from the routine workspace.

## Actors
- User interacting in routine workspace route (/routines/:routineId)
- RoutineWorkspace component orchestrating actions
- CategoryAccordion and HabitRow presenting delete controls
- Repository layer persisting deletion changes

## Habit Delete Contract

### Trigger
- A trash-icon button is rendered in each habit row to the right of the Edit button.
- Accessibility name requirement: button has an explicit, target-specific aria-label.

### Confirm Flow
1. User activates habit delete button.
2. Confirmation dialog opens with:
   - title: clear destructive action title
   - message: irreversible/impact explanation aligned with routine deletion dialog pattern
   - buttons: confirm and cancel
3. No data mutation occurs before confirm.

### Confirm Outcome
- On confirm success:
  - Habit is soft-deleted (status/deletedAt updated).
  - Habit no longer appears for current/future day in active workspace.
  - Historical entries remain preserved and available for past dates.
- On confirm failure:
  - Habit remains visible.
  - Error notification/message is shown.

### Cancel Outcome
- Dialog closes.
- Habit remains unchanged.

## Category Delete Contract

### Trigger
- A trash-icon button is rendered in each category header to the right of the Edit button.
- Accessibility name requirement: button has an explicit, target-specific aria-label.

### Confirm Flow
1. User activates category delete button.
2. Confirmation dialog opens with category-specific destructive text.
3. No data mutation occurs before confirm.

### Confirm Outcome
- On confirm success (routine-scoped):
  - Targeted category is removed from active routine workspace.
  - Habits belonging to that category are soft-deleted for the same routine scope.
  - Historical entries for impacted habits remain preserved for past dates.
  - Categories/habits in other routines are unchanged.
- On confirm failure:
  - Category and habits remain visible.
  - Error notification/message is shown.

### Cancel Outcome
- Dialog closes.
- Category and contained habits remain unchanged.

## Test Assertions
- Delete controls appear in required visual order (Edit then Trash).
- Dialog opens for both habit and category delete actions.
- Confirm performs targeted removal only.
- Cancel preserves data.
- Failure path preserves visibility and emits error notification.
- Historical entries remain after confirmed deletion.
- Cross-routine entities are unaffected.
