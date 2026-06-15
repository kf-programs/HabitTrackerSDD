# Feature Specification: Habit Goal Completion Controls

**Feature Branch**: `[004-habit-goal-completion]`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "new habit related features/bug fixes:
- When setting up a counter type habit, user should be able to set a condition: a \"goal\" number, and an operator (greater than, less than, equal to). When the habit is saved and viewed on the routine, these choices should be shown to the user. When entering their value/completion, counter habits should then have a \"set\" button, which sets the counter value. If the value set meets the condition set up for the habit, then the habit is marked as completed. User should be able to edit the value after it was set similar to how the Measurement habit allows changes.
- Currently the button for weekly yes/no habits says \"Done this week\" after the user clicks the button to complete the habit and then the button is no longer clickable. The button should instead provide the functionality to mark the habit as incomplete (user changes their mind) and should say \"Mark incomplete\". This functionality should be the same for daily yes/no habits."

## Clarifications

### Session 2026-06-15

- Q: What numeric precision should counter goals and set values support? -> A: Integer-only values (reject decimals).
- Q: How should completion behave when a counter goal/operator changes after a value was already set? -> A: Immediately recompute completion from the current set value.
- Q: What yes/no control labels should be used for daily vs weekly states? -> A: Daily uses Mark complete/Mark incomplete; weekly uses Mark done this week/Mark incomplete.
- Q: How should existing counter habits without a configured condition behave? -> A: Keep them editable, but require condition setup before they can be marked complete.
- Q: Can users edit a counter value directly after pressing Set without first pressing Unset? -> A: No. Pressing Set locks the counter input and replaces the Set button with an Unset button. To re-edit, the user must press Unset first, which deletes the stored entry and clears completion; the counter then returns to its editable state with ± step buttons and the Set button.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Complete Counter Goals (Priority: P1)

Users can configure a counter habit with a numeric goal and comparison operator, then set their current value to determine whether the habit is completed.

**Why this priority**: This is the primary requested capability and unlocks meaningful completion logic for counter habits.

**Independent Test**: Can be fully tested by creating a counter habit with each operator type, setting values on routine view, and verifying completion status changes correctly based on the configured condition.

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a counter habit, **When** they choose a goal value and operator (greater than, less than, or equal to), **Then** the habit is saved with that completion condition.
2. **Given** a saved counter habit with a completion condition, **When** the user opens the routine, **Then** the configured goal and operator are visible with the habit.
3. **Given** a counter habit has a configured condition, **When** the user enters a value and presses the set control, **Then** the value is stored and completion status updates according to the configured condition.

---

### User Story 2 - Adjust Counter Values After Setting (Priority: P1)

Users can change a previously set counter value, and the habit completion state recalculates immediately from the new value.

**Why this priority**: Users need to correct mistakes and update progress without losing control after the first set action.

**Independent Test**: Can be fully tested by setting an initial value that marks complete, editing it to a non-completing value, and confirming completion reverses (and vice versa).

**Acceptance Scenarios**:

1. **Given** a counter value is already set (input is locked), **When** the user activates Unset and then enters a new value and presses Set, **Then** the stored entry is replaced by the new value and completion re-evaluates against the configured condition.
2. **Given** a counter value is Unset and re-entered as a value that no longer meets the configured condition, **When** the user presses Set, **Then** the habit is shown as incomplete.
3. **Given** a counter value is Unset and re-entered as a value that meets the configured condition, **When** the user presses Set, **Then** the habit is shown as complete.

---

### User Story 3 - Toggle Yes/No Completion State (Priority: P2)

Users can reverse completion for daily and weekly yes/no habits after initially marking them complete.

**Why this priority**: This fixes a current usability defect where users cannot correct accidental completion taps.

**Independent Test**: Can be fully tested by marking a daily and a weekly yes/no habit complete, then using the same control to mark each one incomplete.

**Acceptance Scenarios**:

1. **Given** a daily yes/no habit is complete, **When** the user activates the completion control again, **Then** the habit changes to incomplete and the control label indicates the new action state.
2. **Given** a weekly yes/no habit is complete, **When** the user activates the completion control again, **Then** the habit changes to incomplete and the control label indicates the new action state.
3. **Given** a daily or weekly yes/no habit is incomplete, **When** the user marks it complete, **Then** the control offers the option to mark it incomplete.

### Edge Cases

- A user attempts to save a counter habit without a valid numeric goal; the system should block invalid condition setup and preserve any valid user input already entered.
- A counter value exactly matches the goal when the operator is greater than or less than; completion should remain incomplete.
- A counter goal or set value includes decimal input; the system should reject the decimal input and require integer values.
- A user rapidly toggles daily or weekly yes/no completion multiple times; the final stored state should match the most recent user action.
- A counter habit condition is changed after past values exist; future completion evaluation should use the latest condition while preserving historical entries.
- A counter habit condition is changed after a current value is already set; completion state should immediately re-evaluate against the latest condition.
- Existing counter habits with no condition should remain visible and editable, but should not become complete until a condition is configured.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to configure a counter habit with a numeric goal value.
- **FR-002**: System MUST allow users to select a comparison operator for counter goal evaluation: greater than, less than, or equal to.
- **FR-003**: System MUST save and retain counter goal configuration for each counter habit.
- **FR-004**: System MUST display the configured counter goal and operator in routine habit view.
- **FR-005**: System MUST provide a set action for counter habits that records the entered value as the current completion input.
- **FR-006**: System MUST evaluate counter completion status by comparing the set value against the configured goal and operator.
- **FR-007**: System MUST allow users to change a previously set counter value by first activating an Unset control; Unset deletes the stored entry, clears completion state, and returns the counter input to its editable state so the user may enter a new value and press Set again.
- **FR-008**: System MUST recalculate and update completion state whenever a counter value is newly set, unset, or when the goal condition changes.
- **FR-009**: System MUST allow daily yes/no habits to toggle from complete back to incomplete.
- **FR-010**: System MUST allow weekly yes/no habits to toggle from complete back to incomplete.
- **FR-011**: System MUST present completion control labels that match the current state and available action.
- **FR-012**: System MUST preserve expected completion behavior for existing non-counter habit types.
- **FR-013**: System MUST accept only integer values for counter goals and counter set values, and MUST reject decimal inputs.
- **FR-014**: System MUST immediately recompute counter habit completion using the currently set value whenever goal or operator configuration changes.
- **FR-015**: System MUST use state-accurate yes/no control labels: daily habits show Mark complete when incomplete and Mark incomplete when complete; weekly habits show Mark done this week when incomplete and Mark incomplete when complete.
- **FR-016**: System MUST keep existing counter habits without configured goal/operator editable and visible, but MUST prevent them from being marked complete until a valid condition is configured.
- **FR-017**: System MUST lock the counter numeric input after Set is pressed, displaying an Unset control in place of the Set button, until the user activates Unset.
- **FR-018**: System MUST display − and + step buttons adjacent to the counter numeric input when the habit is in the editable (not-yet-set) state; these controls MUST be hidden when the counter is in the Set (locked) state.
- **FR-019**: The daily and weekly timeline grid MUST determine counter habit completion using the configured goal condition (operator and goal value); a counter entry MUST NOT be treated as completed based solely on a positive integer value when a goal condition is configured.

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

- **Counter Completion Condition**: Goal configuration tied to a counter habit, including operator and target number used to evaluate completion.
- **Counter Completion Value**: The latest user-set numeric value for a counter habit instance used for completion evaluation.
- **Yes/No Completion State**: Toggleable complete or incomplete status for daily and weekly yes/no habits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation tests, 100% of counter habits can be created with a goal and one of the three supported operators.
- **SC-002**: In validation tests, 100% of counter habit completions match the expected result for greater-than, less-than, and equal operators across representative value sets.
- **SC-003**: In correction-flow tests, 100% of counter value corrections follow the Unset → edit → Set lifecycle: Unset clears the stored entry and completion state, the user enters a new value, and Set persists the new value and re-evaluates completion.
- **SC-004**: In daily and weekly yes/no toggle tests, 100% of completed habits can be reverted to incomplete in one user action.
- **SC-005**: In regression tests, existing habit interactions outside these flows continue to pass with no newly introduced failures.

### Post-Release KPI (Non-Blocking)

- **KPI-001**: In usability checks, at least 90% of users can identify a counter habit's configured goal condition directly from routine view without extra navigation.
- **KPI-002**: In usability checks, at least 90% of users can successfully complete the Unset → edit → Set correction flow without guidance.

## Assumptions

- Counter goal conditions are optional only for non-counter habit types and required for counter habit completion logic.
- Counter goals and set values are integer-only and decimal values are invalid input.
- Weekly yes/no completion remains scoped to the active week context already used by the product.
- Existing historical completion records remain intact when this feature is introduced.
- Existing counter habits may exist without condition metadata at rollout and must remain accessible for configuration updates.
- Control text may differ slightly across views as long as action intent remains unambiguous and state-accurate.