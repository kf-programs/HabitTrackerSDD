# Quickstart: Daily Journal Entries

## Goal

Validate that routine journal entries are saved per selected date and per routine, then reloaded correctly when navigating dates.

## Prerequisites

- Dependencies installed:

```bash
npm install
```

## Run app

```bash
npm run dev
```

## Manual Validation

1. Open any existing routine workspace.
2. Confirm a `Journal` textarea appears between the timeline section and the first category accordion.
3. Type a journal note for today and pause typing.
4. Refresh the page; verify the same note appears for today.
5. Switch to a previous date using timeline controls/date picker.
6. Verify journal content is date-specific (empty if not yet written for that day).
7. Enter a different note for that previous date and switch back to today.
8. Verify today's note is unchanged and previous-day note is retained.
9. Open another routine on the same date and verify the first routine's journal text does not appear.
10. Paste text beyond 2,000 characters and verify input is capped at 2,000.
11. Clear journal text completely, blur the field, refresh, and verify cleared state persists for that date.

## Automated Validation

```bash
npm run test -- src/test/repositories/routineJournalRepository.test.ts src/test/components/RoutineWorkspace.journal.test.tsx src/test/components/RoutineWorkspace.journal-performance.test.tsx
npm run lint
npm run test
```

## Expected Results

- One persisted journal state exists per `(routineId, dayKey)`.
- Date/routine switches always load the correct scoped note.
- Auto-save triggers on typing pause, blur, and selected-date change.
- Input never exceeds 2,000 characters.
- Full lint and test gates pass with no failing suites.
