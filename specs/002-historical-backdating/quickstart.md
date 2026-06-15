# Quickstart: Historical Navigation and Backdating

## Prerequisites
- Node.js 20+
- npm 10+

## Install
```bash
npm install
```

## Run Development Server
```bash
npm run dev
```

## Run Tests
```bash
npm run test -- --run
```

## Run Lint
```bash
npm run lint
```

## Validate Local Gate
```bash
npm run lint && npm run test -- --run && npm run build
```

## Implementation Sequence
1. Update habit and daily-record schema/repositories to support deletedAt and habitId+logDate uniqueness.
2. Implement idempotent upsert save path in entries repository/service layer.
3. Implement selected-date query that merges date-valid habits with same-date records.
4. Update checklist rendering to support historical fallback for type mismatches (checkbox-complete, no numeric display).
5. Add/expand tests for repository uniqueness, soft-delete visibility windows, upsert behavior, and fallback rendering.

## Manual Validation
1. Navigate to a past date, change values, return to today, and verify date isolation.
2. Repeatedly toggle one habit on the same day and verify only one persisted habit-date record exists.
3. Delete a habit and verify it remains visible on eligible historical dates but hidden on current/future dates.
4. Seed or edit a mismatched historical numeric record and verify fallback renders as completed checkbox with no counter value.
