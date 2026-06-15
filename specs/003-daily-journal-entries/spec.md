# Feature Specification: Daily Journal Entries

**Feature Branch**: `[003-daily-journal-entries]`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "new feature request, journal entries:

- Add a new \"Journal\" property on a routine. For every day, a user should be able to record an optional journal entry. This should be a text area that is between the timeline and the first category. It should be saved to the database so that when an older date is selected, the user can see what they recorded that date, or update their journal entry for that day."

## Clarifications

### Session 2026-06-15

- Q: How should journal saves be triggered? -> A: Auto-save on pause (debounced) and on blur/date change.
- Q: What should the journal entry length limit be? -> A: 2,000 characters.
- Q: Which day-boundary model should journal entries use? -> A: Device local calendar day (same as selected-date behavior).
- Q: What debounce interval defines a "typing pause" for auto-save? -> A: 600 ms.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture a Daily Journal Note (Priority: P1)

Users can enter an optional journal note for the currently selected day within a routine, using a text area placed between the timeline and the first category.

**Why this priority**: The core value of the feature is the ability to quickly record daily context alongside habit completion.

**Independent Test**: Can be fully tested by selecting a routine day, entering text in the journal area, saving, refreshing, and confirming the same note appears for that date.

**Acceptance Scenarios**:

1. **Given** a routine is open on a selected day, **When** the user enters text in the journal area and saves, **Then** the journal entry is stored for that routine and that day.
2. **Given** a journal entry already exists for the selected day, **When** the user edits and saves it, **Then** the existing entry for that same routine-day is updated rather than duplicated.
3. **Given** the user leaves the journal empty, **When** they save or leave it unchanged, **Then** the routine day remains valid with no required journal content.
4. **Given** the user edits journal text, **When** they pause typing for 600 ms, leave the field, or change selected date, **Then** the entry is auto-saved to the active routine-day context.
5. **Given** the user enters journal text over the supported limit, **When** input reaches 2,000 characters, **Then** additional input is prevented and existing text remains unchanged.

---

### User Story 2 - View Historical Journal Entries by Date (Priority: P1)

Users can navigate to older dates and immediately see the journal content that was previously recorded for the selected date.

**Why this priority**: Date-scoped recall is essential so users can reflect on past days and maintain continuity.

**Independent Test**: Can be fully tested by recording notes on multiple dates, switching among those dates, and confirming each date shows only its own journal content.

**Acceptance Scenarios**:

1. **Given** journal entries exist on multiple days, **When** the user switches the selected date, **Then** the journal area loads the entry that corresponds to that exact date.
2. **Given** no journal entry exists for a selected date, **When** that date is opened, **Then** the journal area appears empty and ready for optional input.

---

### User Story 3 - Keep Journal Scoped to Routine (Priority: P2)

Users with multiple routines see journal entries that belong only to the currently open routine, even for the same calendar date.

**Why this priority**: Routine-level separation prevents cross-routine data confusion and preserves context integrity.

**Independent Test**: Can be fully tested by creating different journal notes on the same date in two routines and confirming each routine shows only its own note.

**Acceptance Scenarios**:

1. **Given** two routines each have notes for the same date, **When** the user switches routines, **Then** the journal area displays the note for the active routine only.
2. **Given** the user updates a note in one routine, **When** they open another routine on that date, **Then** the other routine's note is unchanged.

### Edge Cases

- The user enters very long text; the app should preserve the full journal content up to the supported limit and keep the UI usable.
- The user clears an existing journal entry and saves; the app should persist the cleared state for that routine-day.
- The user rapidly changes dates while editing; the saved result should remain attached to the intended selected date and not leak into other dates.
- The user creates a new routine with no prior entries; the journal area should still render correctly for the selected day.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a journal input area in each routine workspace.
- **FR-002**: System MUST place the journal input area between the timeline section and the first category section.
- **FR-003**: System MUST allow users to create an optional journal entry for the currently selected date.
- **FR-004**: System MUST persist journal entries so they remain available across app reloads.
- **FR-005**: System MUST scope each journal entry to both routine identity and calendar date.
- **FR-006**: System MUST load and display the journal entry associated with the currently selected date.
- **FR-007**: System MUST update an existing journal entry for the same routine-date rather than creating duplicate records.
- **FR-008**: System MUST allow users to leave the journal entry empty without blocking routine usage.
- **FR-009**: System MUST preserve isolation between routines so one routine's journal entries never appear in another routine.
- **FR-010**: System MUST retain journal history so users can view and edit prior-day notes when navigating dates.
- **FR-011**: System MUST auto-save journal changes after 600 ms of typing inactivity and MUST flush pending changes on field blur or selected-date change.
- **FR-012**: System MUST enforce a maximum journal entry length of 2,000 characters per routine-day.
- **FR-013**: System MUST bind journal entry storage and retrieval to device local calendar-day boundaries using the same selected-date logic as routine checklist behavior.

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

- **Routine Daily Journal Entry**: A routine-scoped, date-scoped text note representing the user's optional reflection for one calendar day.
- **Routine**: The parent context that owns categories, habits, and daily journal entries.
- **Selected Date Context**: The active calendar day used to load and save date-specific journal data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of saved journal notes are retrievable for the same routine and date after page reload.
- **SC-002**: Users can switch to any supported historical date and see that date's journal content within 1 second for at least 95% of navigations.
- **SC-003**: In validation tests, 100% of same-day edits produce one final journal state per routine-date (no duplicates).
- **SC-004**: In usability checks, at least 90% of participants can find the journal area and record a note without guidance.
- **SC-005**: In multi-routine tests, 100% of journal entries remain isolated to their originating routine.
- **SC-006**: In input constraint tests, 100% of journal entries reject characters beyond 2,000 while preserving the first 2,000 characters.
- **SC-007**: In date-boundary validation tests, 100% of journal saves and reads resolve to the same local day key used by selected-date navigation.

## Assumptions

- Journal entries are plain text and do not require rich formatting.
- Journal entry input remains optional; no minimum content is required.
- Historical date navigation range follows the existing timeline window already supported by the product.
- Users expect journal content to be private and local in the same way as other routine data.
- Existing selected-date behavior remains the source of truth for which day the journal entry represents.
- Journal save UX uses auto-save only (no required explicit save button).
- Maximum journal entry size is capped at 2,000 characters.
- Journal day scoping follows device local calendar-day boundaries consistent with selected-date behavior.
- Auto-save debounce interval is fixed at 600 ms.
