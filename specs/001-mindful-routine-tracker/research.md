# Research: Mindful Routine Tracker

## Decision 1: Local Persistence via Dexie + IndexedDB
- Decision: Use Dexie.js as the data access layer over IndexedDB and `dexie-react-hooks` `useLiveQuery` for reactive reads.
- Rationale: Dexie provides structured schema/versioning, transactional CRUD, and efficient local queries while preserving offline-first requirements.
- Alternatives considered:
  - localStorage only: rejected due to poor queryability and size limitations.
  - Zustand-only in-memory: rejected because persistence and query semantics are insufficient alone.
  - PouchDB: rejected as unnecessary complexity for single-device scope.

## Decision 2: Repository + Service Layer Split
- Decision: Implement Dexie CRUD in repositories and keep cross-entity business rules in services.
- Rationale: Clear separation keeps UI components thin and testable while supporting future schema evolution.
- Alternatives considered:
  - Direct Dexie calls in components: rejected because it couples UI and persistence concerns.
  - Single monolithic data service: rejected due to reduced modularity and test isolation.

## Decision 3: URL Payload Compression Strategy
- Decision: Use `lz-string` with URL-safe Base64 output for share links.
- Rationale: Balances payload compactness and browser-safe URL transport for stateless sharing.
- Alternatives considered:
  - Raw JSON in query: rejected due to long URLs.
  - Custom compression: rejected due to higher maintenance and risk.

## Decision 4: Timeline Rendering and History Preservation
- Decision: Persist completion-derived timeline tile metadata and render a 120-day daily window plus Sunday-start weekly ribbon.
- Rationale: Guarantees historical continuity despite edits/deletes and aligns with clarified boundary rules.
- Alternatives considered:
  - Recompute full history from active habits only: rejected because deleted/archived habit history could be lost.
  - SVG-only timeline renderer: deferred; DOM-first implementation is simpler for accessibility.

## Decision 5: UI Composition Strategy
- Decision: Use a flat modular component map with dedicated views (`DashboardView`, `AllRoutinesView`, `RoutineWorkspace`) and focused subcomponents (`CategoryAccordion`, `HabitRow`, `ParallelTimelines`, `DailyGrid`, `WeeklyRibbon`).
- Rationale: Supports one-component-per-file governance and minimizes coupling between layout and behavior.
- Alternatives considered:
  - Deep nested container pattern: rejected due to higher indirection.
  - Single workspace mega-component: rejected for maintainability reasons.

## Decision 6: PWA and Offline Caching
- Decision: Configure Vite PWA plugin with app-shell caching and local asset pre-cache; all user data remains in IndexedDB.
- Rationale: Ensures reliable offline startup and interaction with no backend dependency.
- Alternatives considered:
  - Manual service worker implementation: rejected for higher defect risk.
  - Network-first caching: rejected because app must remain functional offline.
