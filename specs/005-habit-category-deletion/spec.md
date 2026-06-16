# Feature Specification: Habit and Category Deletion

**Feature Branch**: `[005-habit-category-deletion]`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Add a button to allow the user to delete a habit from a routine. The button should be a trash icon to the right of the \"Edit\" button for the habit. There should be a confirmation dialogue similar to the one that confirms deletion of a routine. Add a button to allow the user to delete a category from a routine. The button should be a trash icon to the right of the \"Edit\" button for the category. There should be a confirmation dialogue similar to the one that confirms deletion of a routine."

## Clarifications

### Session 2026-06-16

- Q: What should happen to historical entries when deleting a habit/category? -> A: Remove from active routine view, but preserve historical entries for past dates.
- Q: What is the deletion scope for category removal? -> A: Deletion removes only that category and its habits in the current routine.
- Q: What should happen if deletion persistence fails? -> A: Keep item visible and show an error message; no deletion is applied.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Habit From Routine (Priority: P1)

Users can remove an unwanted habit directly from a routine using a trash icon beside the habit edit control, with confirmation before deletion.

**Why this priority**: Habit-level cleanup is a frequent maintenance task and directly affects daily usability.

**Independent Test**: Can be fully tested by opening a routine, clicking the habit trash icon, confirming deletion, and verifying the habit no longer appears while other habits remain unchanged.

**Acceptance Scenarios**:

1. **Given** a routine with at least one habit, **When** the user clicks the habit trash icon and confirms deletion, **Then** the selected habit is removed from the routine view.
2. **Given** a routine with at least one habit, **When** the user clicks the habit trash icon and cancels deletion, **Then** the selected habit remains unchanged.
3. **Given** a habit row in a routine, **When** the row is displayed, **Then** the trash icon appears to the right of the habit Edit button.

---

### User Story 2 - Delete Category From Routine (Priority: P1)

Users can remove an unwanted category directly from a routine using a trash icon beside the category edit control, with confirmation before deletion.

**Why this priority**: Category-level cleanup is core organizational behavior and should be available in the same workflow as category editing.

**Independent Test**: Can be fully tested by opening a routine, clicking the category trash icon, confirming deletion, and verifying the category is removed from the routine view.

**Acceptance Scenarios**:

1. **Given** a routine with at least one category, **When** the user clicks the category trash icon and confirms deletion, **Then** the selected category is removed from the routine view.
2. **Given** a routine with at least one category, **When** the user clicks the category trash icon and cancels deletion, **Then** the selected category remains unchanged.
3. **Given** a category accordion in a routine, **When** the accordion header is displayed, **Then** the trash icon appears to the right of the category Edit button.

---

### User Story 3 - Confirm Before Destructive Actions (Priority: P2)

Users are prompted with a confirmation dialog before deleting either a habit or a category, following the same interaction pattern used for routine deletion.

**Why this priority**: Preventing accidental data loss is essential, but this story depends on the existence of deletion actions.

**Independent Test**: Can be fully tested by triggering both delete actions and confirming dialog title/message/actions mirror routine deletion behavior patterns.

**Acceptance Scenarios**:

1. **Given** a user initiates habit deletion, **When** the confirmation dialog opens, **Then** it presents clear confirm and cancel actions before any data changes occur.
2. **Given** a user initiates category deletion, **When** the confirmation dialog opens, **Then** it presents clear confirm and cancel actions before any data changes occur.
3. **Given** a user confirms either deletion, **When** the action completes, **Then** only the targeted entity is removed and the rest of the routine remains available.

---

### Edge Cases

- A user tries to delete the only remaining category in a routine; the system should complete deletion safely and keep the routine usable afterward.
- A user rapidly clicks a delete icon multiple times; the system should avoid duplicate destructive operations for the same target.
- A user opens a deletion dialog and navigates away or dismisses it; no deletion should occur unless the confirm action is explicitly chosen.
- A category containing multiple habits is deleted; the system should consistently remove associated category content from the routine view after confirmation.
- If persistence fails during confirmed deletion, the original habit/category should remain visible and an error message should be shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a habit delete control represented by a trash icon in each habit row.
- **FR-002**: System MUST place the habit delete trash icon to the right of the habit Edit button.
- **FR-003**: System MUST open a confirmation dialog before deleting a habit.
- **FR-004**: System MUST remove the targeted habit from the active routine workspace only after the user confirms in the dialog.
- **FR-005**: System MUST leave the habit unchanged when the habit deletion dialog is canceled.
- **FR-006**: System MUST provide a category delete control represented by a trash icon in each category header.
- **FR-007**: System MUST place the category delete trash icon to the right of the category Edit button.
- **FR-008**: System MUST open a confirmation dialog before deleting a category.
- **FR-009**: System MUST remove the targeted category from the active routine workspace only after the user confirms in the dialog.
- **FR-010**: System MUST leave the category unchanged when the category deletion dialog is canceled.
- **FR-011**: System MUST use confirmation dialog interaction behavior consistent with routine deletion, including role="dialog", a title, a descriptive message, and visible Confirm and Cancel actions.
- **FR-012**: System MUST update the routine workspace UI immediately after confirmed deletion so removed items are no longer displayed.
- **FR-013**: System MUST preserve historical habit/category entries for past dates after confirmed deletion from the active routine workspace.
- **FR-014**: System MUST apply category deletion only within the currently open routine and MUST NOT delete similarly named categories or habits from other routines.
- **FR-015**: System MUST keep the targeted habit/category visible and show an error notification when confirmed deletion fails to persist.
- **FR-016**: System MUST hard-delete the targeted category record from the current routine while preserving associated historical entries by soft-deleting dependent habits.

### Engineering Constraints *(mandatory)*

- **EC-001**: Frontend implementation MUST use TypeScript + React with Vite.
- **EC-002**: UI components MUST be functional components using Hooks; class components are prohibited.
- **EC-003**: Components MUST remain modular with one component per file.
- **EC-004**: Styling MUST use Tailwind CSS and include responsive behavior.
- **EC-005**: New feature work MUST include Vitest + React Testing Library tests that cover core logic,
  user interactions, and state updates.
- **EC-006**: Delivery MUST pass automated lint and test checks before integration.
- **EC-007**: Automation MUST NOT auto-commit code; commits are human-controlled.

### Key Entities *(include if feature involves data)*

- **Habit**: A trackable routine item that can be edited or deleted within a category.
- **Category**: A grouping container for habits within a routine that can be edited or deleted.
- **Deletion Confirmation Dialog**: A user confirmation step that gates destructive actions for habits and categories.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation tests, 100% of displayed habits show a trash icon control positioned to the right of the Edit button.
- **SC-002**: In validation tests, 100% of displayed categories show a trash icon control positioned to the right of the Edit button.
- **SC-003**: In confirmation-flow tests, 100% of canceled habit and category deletion attempts leave the original data unchanged.
- **SC-004**: In deletion-flow tests, 100% of confirmed habit and category deletions remove only the targeted entity from the routine workspace display.
- **SC-005**: In historical-data tests, 100% of confirmed deletions preserve pre-existing past-date entries for the removed habit/category.
- **SC-006**: In deletion-error tests, 100% of persistence failures keep the targeted habit/category visible and emit an error notification.
- **SC-007**: In dialog-parity tests, 100% of habit/category delete dialogs expose role="dialog", a title, a descriptive message, and Confirm/Cancel actions before any data mutation.

## Assumptions

- Existing repository deletion capabilities for habits and categories are available or can be extended without changing user-facing workflow expectations.
- Deleting a category hard-deletes the category record for the current routine and removes its visible container and related habit rows from the active workspace view while preserving past historical entries through soft-deleted habits.
- Category and habit deletion actions in this feature are routine-scoped and do not cascade to other routines.
- Existing routine deletion confirmation dialog structure is the baseline interaction pattern for new deletion confirmations.
- No additional role-based permission model is required for routine, habit, or category deletion in this scope.
