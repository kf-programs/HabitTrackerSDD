# Quickstart: Habit Goal Completion Controls

## Goal
Validate counter goal configuration + set-based completion, reversible daily/weekly yes-no behavior, and legacy counter compatibility.

## Prerequisites

```bash
npm install
```

## Run app

```bash
npm run dev
```

## Manual Validation
1. Open any routine and add or edit a counter habit.
2. Configure goal operator (`>`, `<`, or `=`) and integer goal value.
3. Save and confirm the goal summary is visible in routine view.
4. Enter a counter value and click `Set`; verify completion status reflects condition.
5. Change the value, click `Set` again, and verify completion updates from the new value.
6. Change goal/operator and verify completion re-evaluates immediately against current value.
7. Enter a decimal in goal or set value and verify input is rejected as invalid.
8. For a daily yes/no habit, mark complete, then click again to mark incomplete.
9. For a weekly yes/no habit, mark done this week, then click again to mark incomplete.
10. Open a legacy counter habit without condition (if present) and verify it stays editable but cannot be complete until condition is configured.

## Automated Validation

```bash
npm run lint
npm run test -- --run src/test/components/HabitRow.idempotent-updates.test.tsx src/test/components/RoutineWorkspace.test.tsx src/test/components/RoutineWorkspace.history-regression.test.tsx
npm run test
```

The one-shot validation above should now include the counter-goal feature slice, the legacy counter regression check, and the reversible yes/no behavior coverage.

## Expected Results
- Counter conditions save and display correctly.
- Counter completion is determined only by operator + integer goal comparison.
- Counter values are editable after initial set and replace prior values.
- Goal/operator changes immediately re-evaluate completion.
- Daily and weekly yes/no controls both toggle complete/incomplete.
- Existing counter habits without condition remain usable but non-completable until configured.
- Lint and tests pass.