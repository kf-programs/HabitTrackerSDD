# Feature Specification: Historical Navigation and Backdating

**Feature Branch**: `[006-new-spec-request]`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "New feature request to support historical navigation and backdating with idempotent daily updates, lifecycle-safe habit history, and unified visual checklist continuity across dates."

## Clarifications

### Session 2026-06-15

- Q: What is the canonical fallback policy for historical type-mismatched numeric records? -> A: Render as completed checkbox for that historical day and do not show a counter value for that record.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate and Log Past Days (Priority: P1)

Users can move the active calendar view to previous dates (such as yesterday or any earlier day in range), review what was logged, and add or edit that day's habit outcomes.

**Why this priority**: Backdating forgotten logs is core to trust in tracking and directly affects daily retention.

**Independent Test**: Can be fully tested by selecting a past date, updating one or more habits on that date, and confirming only that day's records change while other dates remain unchanged.

**Acceptance Scenarios**:

1. **Given** today is selected and past dates exist, **When** the user switches to a past date, **Then** the app shows that date as active and loads the habits and logs for that specific date.
2. **Given** a past date is active, **When** the user marks a habit complete or updates its value, **Then** the selected date record is updated and the change is visible immediately for that date.
3. **Given** a user returns from a past date to today, **When** today becomes active again, **Then** today's checklist state is preserved and unaffected by edits made on past dates.

---

### User Story 2 - Update Daily State Without Duplicates (Priority: P1)

Users can toggle completion and modify habit counters or measurements repeatedly on the same calendar day without creating duplicate rows.

**Why this priority**: Duplicate entries make habit history unreliable and reduce confidence in progression analytics.

**Independent Test**: Can be fully tested by performing multiple updates on one habit for one day and confirming the day retains exactly one stored state for that habit.

**Acceptance Scenarios**:

1. **Given** a habit already has a value on an active day, **When** the user changes that value again, **Then** the existing daily record is overwritten/updated rather than duplicated.
2. **Given** a binary habit on an active day, **When** the user toggles completion repeatedly, **Then** the visible state always matches the final interaction and only one daily record exists.

---

### User Story 3 - Preserve Historical Integrity Through Habit Changes (Priority: P2)

Users can rename habits, change tracking criteria, or delete habits from active planning while historical logs remain coherent and visible for dates where the habit was active.

**Why this priority**: Habit evolution is common; losing history during edits or deletion would break longitudinal progress context.

**Independent Test**: Can be fully tested by logging past data for a habit, then renaming or deleting it, and verifying historical days still display prior completions while current/future lists reflect lifecycle changes.

**Acceptance Scenarios**:

1. **Given** a habit has historical records, **When** the user renames the habit, **Then** all historical records remain connected to that habit and appear under the updated name.
2. **Given** a habit with historical records is deleted, **When** the user views a past date where it was active, **Then** the habit and its logged value remain visible for that date.
3. **Given** a habit is deleted, **When** the user views today or future dates, **Then** that habit no longer appears in active daily lists.

---

### User Story 4 - Keep Rewarding Visual Feedback Across Dates (Priority: P3)

Users see a consistent checklist presentation on any selected date, with clear completion styling on each habit item so reward feedback remains familiar in historical views.

**Why this priority**: Visual consistency reduces cognitive load and sustains motivation cues when users review prior days.

**Independent Test**: Can be fully tested by checking multiple dates with mixed completion states and verifying the same checklist layout and completion indicators are applied consistently.

**Acceptance Scenarios**:

1. **Given** any date with completed and incomplete habits, **When** the checklist is rendered, **Then** each completed item uses the same completion feedback style used on the current day.
2. **Given** the user navigates across dates, **When** each day view loads, **Then** checklist structure remains unified and only state values differ by date.
3. **Given** a historical record value does not match the habit's current tracking type, **When** that day is rendered, **Then** the app renders the record as a completed checkbox state and does not show a counter value, instead of failing the view.

### Edge Cases

- A user navigates to a date before the earliest tracked habit activation; the app should show an empty or zero-state checklist with clear context.
- A habit is deleted and then the user navigates to a date after deletion but before current day; deleted habit must remain hidden for those post-deletion dates.
- A user rapidly toggles a habit multiple times on one day; final visible state and stored state must match with no duplicate day records.
- A user changes date while an edit is in progress; changes must apply to the originally active date or be safely canceled to avoid cross-date corruption.
- A historical record has a legacy or null value that conflicts with the habit's current tracking mode; the app must render that record as completed checkbox state (no counter value) and keep the day usable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to change the active calendar date view to supported past dates and return to the current day.
- **FR-002**: System MUST load and display the set of habits that were active on the selected date, not only the currently active habit set.
- **FR-003**: System MUST enforce a single daily state per habit per calendar day.
- **FR-004**: System MUST update the existing daily state when users make repeated interactions on the same habit and day.
- **FR-005**: System MUST persist completion, counter, and measurement updates to the selected date context only.
- **FR-006**: System MUST preserve historical records when habit metadata (for example, name or tracking criteria) is modified.
- **FR-007**: System MUST apply metadata changes consistently across historical records so progression remains connected to the same habit identity.
- **FR-008**: System MUST remove deleted habits from current and future daily habit lists.
- **FR-009**: System MUST retain and render historical records for deleted habits on dates where they were active.
- **FR-010**: System MUST render a unified checklist format for all selected dates with clear completion-state visual feedback on each item.
- **FR-011**: System MUST ensure historical date rendering includes both habit presence and logged values as they existed for that date.
- **FR-012**: System MUST prevent duplicate historical lines for the same habit/day even under repeated or rapid user updates.
- **FR-013**: System MUST degrade gracefully when historical record values are incompatible with the current habit tracking type by rendering affected records as completed checkbox state and hiding counter values for those records.

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

- **Habit**: A user-defined routine item with stable identity, descriptive metadata, lifecycle status, and activation/deactivation dates.
- **Habit Daily State**: The single source of truth for one habit on one calendar day, including completion state and optional numeric measurements.
- **Habit Lifecycle Window**: The effective date span during which a habit is considered active for checklist rendering on selected dates.
- **Selected Date Context**: The currently viewed calendar day that scopes all visible checklist items and edits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of habit interactions performed multiple times on the same day result in a single stored daily state per habit/day.
- **SC-002**: Users can switch from today to any supported past date and see that date-specific checklist within 1 second for at least 95% of navigation actions.
- **SC-003**: In validation tests, 100% of deleted habits remain visible on eligible historical dates and 100% are absent from current/future active lists.
- **SC-004**: In usability checks, at least 90% of participants correctly identify completed vs incomplete items on historical dates without additional guidance.
- **SC-005**: After rename or criteria updates, 100% of historical logs remain associated with the same habit identity in progression views.
- **SC-006**: In compatibility tests with legacy or mismatched historical values, 100% of affected days render without crashes and display the defined checkbox-complete fallback (without counter value display).

## Assumptions

- Supported historical navigation range is bounded by existing app timeline limits; this feature does not expand the timeline beyond current product boundaries.
- Calendar-day semantics follow the user's local date boundary behavior already used in the app.
- No cross-user collaboration is in scope; all history and edits remain single-user local data.
- Existing analytics and summaries continue to consume historical records from the same canonical habit identity.
- For incompatible historical values, fallback display behavior is deterministic: treat the record as completed checkbox state and do not display a counter value for that record.
