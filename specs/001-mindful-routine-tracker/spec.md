# Feature Specification: Mindful Routine Tracker

**Feature Branch**: [001-mindful-routine-tracker]

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Privacy-first, offline-capable mindful routine tracker with serverless sharing and non-gamified visual progress fabric"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Track Mindful Routines (Priority: P1)

As a user, I can create routines, categories, and habits and track them daily or weekly without signing up, so I can build consistent personal rituals privately.

**Why this priority**: This is the core value of the product; without routine creation and tracking, the app provides no meaningful utility.

**Independent Test**: Can be fully tested by creating one routine with at least one category and one habit of each tracking type, recording entries for the current day/week, and confirming local persistence after app restart.

**Acceptance Scenarios**:

1. **Given** a first-time user with no account and no routines, **When** they create a routine, add categories, add habits, and save, **Then** the structure is available immediately in local storage and usable offline.
2. **Given** a routine with daily and weekly habits, **When** the user logs Yes/No, Counter, and Measurement entries, **Then** each habit state updates correctly for the active period and is restored after closing and reopening the app.
3. **Given** a measurement entry being edited on mobile, **When** the user dismisses focus or closes the keyboard, **Then** the value is auto-saved and displayed as read mode text with an edit affordance.

---

### User Story 2 - Navigate Calm, Focused Views (Priority: P2)

As a user, I can move between a minimal home dashboard, a segmented routine directory, and a routine workspace optimized for one-handed use, so tracking feels simple and low-stress.

**Why this priority**: The product promise is a calm experience; navigation and visual hierarchy are critical to make daily use sustainable.

**Independent Test**: Can be fully tested by creating multiple routines, switching between Home and All Routines, verifying active/paused segmentation and toggle behavior, and confirming workspace accordion/timeline behavior.

**Acceptance Scenarios**:

1. **Given** at least four active routines, **When** the user opens Home, **Then** only the three most recently accessed active routines are shown.
2. **Given** zero routines, **When** the user opens Home, **Then** a welcoming empty state invitation to create the first routine is shown.
3. **Given** active and paused routines exist, **When** the user opens the routine directory, **Then** active routines appear first, paused routines appear in a visually softer section, and each routine can be toggled active/paused in place.
4. **Given** a routine workspace with multiple categories, **When** the workspace loads, **Then** the first category is expanded by default and other categories are collapsed.

---

### User Story 3 - Preserve History and Share Structure Safely (Priority: P3)

As a user, I can keep historical tracking intact even when habits change, and I can share only routine structure through a link that imports as a fresh local copy.

**Why this priority**: Trust and privacy are central differentiators; preserving past records and preventing private history leakage are required for user confidence.

**Independent Test**: Can be fully tested by logging history, modifying/deleting/archiving a habit, verifying historical visuals remain unchanged, then exporting and importing a routine link and verifying the recipient copy contains structure only.

**Acceptance Scenarios**:

1. **Given** historical entries exist for a habit, **When** the habit is edited, archived, or deleted, **Then** previously generated historical timeline tiles and logs remain unchanged.
2. **Given** a routine with history, **When** the user shares the routine, **Then** the generated link includes routine metadata and structure only and excludes all completion/history logs.
3. **Given** a valid shared link is opened, **When** the app detects import payload and the recipient confirms import, **Then** the routine is added to local storage as a new personal copy without source user history.

### Edge Cases

- If a routine has no daily habits, the daily grid is hidden.
- If a routine has no weekly habits, the weekly ribbon is hidden.
- If both daily and weekly habits are absent, timeline visuals are replaced by contextual guidance.
- If all routines are paused, Home recent list remains empty and prompts user to resume or create routines.
- If local storage is full or unavailable, the user receives a clear, non-technical error and data entry is not silently discarded.
- If a share link payload is corrupted, oversized, or unsupported, import is rejected safely with a clear recovery message.
- If random pastel selection produces poor contrast, the app substitutes an accessible pastel variant while preserving the soft visual style.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow full usage without account creation, authentication, or network connectivity after installation.
- **FR-002**: System MUST store all user data locally on the user device and MUST NOT require a server-side user database.
- **FR-003**: System MUST support Progressive Web App installation and offline operation for routine creation, browsing, and tracking.
- **FR-004**: System MUST support a hierarchy where routines contain categories and categories contain habits.
- **FR-005**: System MUST allow routine creation with required title, optional description, and active/paused state.
- **FR-006**: System MUST support habit timeframes limited to Daily or Weekly.
- **FR-007**: System MUST support tracking types limited to Yes/No, Counter, and Measurement/Scale.
- **FR-008**: System MUST provide a Home Dashboard with time-of-day greeting, up to three most recently accessed active routines, empty state guidance, and persistent bottom navigation.
- **FR-009**: System MUST provide a Routine Directory with active routines listed before paused routines and in-place active/paused toggles.
- **FR-010**: System MUST provide a Routine Workspace with collapsible routine description and category accordion behavior where the first category is open by default.
- **FR-011**: System MUST render a daily timeline grid only when at least one daily habit exists in the routine.
- **FR-012**: System MUST render a weekly ribbon only when at least one weekly habit exists in the routine.
- **FR-013**: System MUST assign a random soft pastel color to a day tile when any daily habit is completed for that day.
- **FR-014**: System MUST light the weekly block on the day a weekly habit is checked complete.
- **FR-015**: System MUST support Yes/No interaction by tap-to-complete with completed visual state and subtle strike-through text.
- **FR-016**: System MUST support Counter interaction with increment and decrement controls and visible current count.
- **FR-017**: System MUST auto-save Measurement entries on blur/keyboard dismissal and switch to read mode with edit affordance after save.
- **FR-018**: System MUST preserve historical tiles and logs when habits are edited, archived, or deleted.
- **FR-019**: System MUST generate a share link that includes only routine structure (routine metadata, categories, habits) and excludes completion/history data.
- **FR-020**: System MUST allow import from a valid share link by showing a confirmation preview and creating a new local copy on acceptance.
- **FR-021**: System MUST reject invalid or unsupported import payloads without modifying existing user data.

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

- **Routine**: Top-level intent container with title, optional description, lifecycle state (active/paused), timestamps, and ordered category references.
- **Category**: Routine-scoped grouping with name, display order, collapsed/expanded UI preference, and habit references.
- **Habit**: Trackable action with title, timeframe (daily/weekly), tracking type (yes-no/counter/measurement), optional unit/label, and lifecycle status.
- **Habit Entry**: Period-bound record of user input for a habit (boolean completion, integer count, or measurement value) with entry timestamp.
- **Timeline Tile**: Derived visual record representing day/week completion state and pastel color assignment, persisted to preserve historical appearance.
- **Share Payload**: Encoded routine structure package containing routine/category/habit definitions and metadata version, explicitly excluding habit entries and timeline history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of first-time users can create their first routine with one category and one habit in under 2 minutes.
- **SC-002**: 95% of tracking interactions (Yes/No tap, Counter update, Measurement save) reflect visibly in under 1 second on a typical mobile device.
- **SC-003**: 100% of routine features remain usable while offline after installation, excluding external link opening actions.
- **SC-004**: 100% of export operations exclude personal completion/history data in validation tests.
- **SC-005**: 100% of tested habit edit/delete/archive actions preserve previously recorded historical timeline appearance.
- **SC-006**: At least 90% of usability-test participants report the interface as calm and non-punitive in post-task feedback.

## Assumptions

- Users may use the app on mobile and desktop, with mobile-first interaction priority.
- Local device storage is the primary persistence mechanism and is expected to be available in normal browser conditions.
- Shared links are intended for routine template transfer, not collaborative multi-user synchronization.
- Importing a shared routine creates an independent copy that can diverge from the source thereafter.
- Pastel color variation is intentionally non-deterministic but constrained to an accessibility-safe palette.
