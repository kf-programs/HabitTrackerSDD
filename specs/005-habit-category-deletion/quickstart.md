# Quickstart: Habit and Category Deletion

## Prerequisites
- Node.js and npm installed
- Dependencies installed via npm install

## Run locally
1. Start app:
   - npm run dev
2. Open routine workspace route:
   - /routines/:routineId

## Validate core behavior manually
1. Habit delete control placement
   - Open any habit row
   - Verify trash icon appears to the right of Edit button
2. Habit confirmation flow
   - Click habit trash icon
   - Verify confirmation dialog appears
   - Click Cancel -> habit remains
   - Repeat and click Confirm -> target habit removed from active workspace
3. Category delete control placement
   - Open category header
   - Verify trash icon appears to the right of Edit button
4. Category confirmation flow
   - Click category trash icon
   - Verify confirmation dialog appears
   - Click Cancel -> category remains
   - Repeat and click Confirm -> target category removed from active workspace
5. Historical preservation
   - Navigate to a day before deletion
   - Verify historical entries remain available for deleted habit/category context
6. Failure behavior
   - Simulate repository failure in test/mocked path
   - Confirm deletion attempt keeps item visible and shows error

## Automated verification
1. Run targeted component tests:
   - npm run test -- --run src/test/components/RoutineWorkspace.test.tsx
   - npm run test -- --run src/test/components/CategoryAccordion.test.tsx
   - npm run test -- --run src/test/components/HabitRow.idempotent-updates.test.tsx
2. Run repository tests:
   - npm run test -- --run src/test/repositories/habitsRepository.soft-delete.test.ts
3. Run lint + full tests before integration:
   - npm run lint
   - npm run test -- --run

## Expected completion signal
- All deletion flow tests pass
- Lint passes
- Confirmed delete affects only targeted entity in active routine scope
- Historical entry preservation assertions pass

## Validation checklist
- [ ] Habit delete dialog opens, cancel preserves, confirm deletes target habit only
- [ ] Category delete dialog opens, cancel preserves, confirm removes target category in active routine only
- [ ] Failure path keeps target visible and shows error notification
- [ ] Historical entries remain preserved after confirmed deletion
- [ ] Lint and full test gates pass
