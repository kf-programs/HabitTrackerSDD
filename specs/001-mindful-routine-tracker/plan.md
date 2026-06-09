# Implementation Plan: Mindful Routine Tracker

**Branch**: `master` | **Date**: 2026-06-09 | **Spec**: [specs/001-mindful-routine-tracker/spec.md](specs/001-mindful-routine-tracker/spec.md)

**Input**: Feature specification from [specs/001-mindful-routine-tracker/spec.md](specs/001-mindful-routine-tracker/spec.md)

## Summary

Build a privacy-first, offline-capable habit tracking SPA that stores all data locally, supports mindful routine tracking (daily and weekly), preserves historical visuals, and provides stateless share/import links that contain structure only. Implementation uses Vite + React + TypeScript, Tailwind CSS with a soft pastel design language, Dexie.js for local persistence with reactive UI updates via `useLiveQuery`, and `lz-string` for URL-safe payload compression.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x

**Primary Dependencies**: React, Vite, Tailwind CSS, Dexie.js, dexie-react-hooks, lz-string, React Router

**Storage**: IndexedDB via Dexie (local-only, no backend)

**Testing**: Vitest + React Testing Library (unit and component tests for core logic, interactions, and state)

**Target Platform**: Mobile-first PWA in modern evergreen browsers (iOS Safari, Android Chrome, desktop Chromium/Firefox/Safari)

**Project Type**: Single-page web application (frontend-only)

**Performance Goals**: Habit interactions update visible UI in under 1 second for p95 local operations; home and workspace render without blocking on remote resources

**Constraints**: Offline-first behavior after install, no account/auth, no server persistence, one-component-per-file, no auto-commit automation

**Scale/Scope**: Single-user local usage, hundreds of routines/habits, 120-day daily timeline window, weekly ribbon with Sunday-start boundaries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Stack gate: PASS. Uses TypeScript + React + Vite.
- Component gate: PASS. Functional components with Hooks and one component per file.
- Styling gate: PASS. Tailwind-first responsive styling with soft pastel system.
- Testing gate: PASS. Vitest + React Testing Library required in each feature phase.
- CI gate: PASS. Plan requires lint/test quality checks before integration.
- Commit control gate: PASS. No auto-commit behavior included.

## Phase 0: Research Output

See [specs/001-mindful-routine-tracker/research.md](specs/001-mindful-routine-tracker/research.md) for architecture and dependency decisions.

## Phase 1: Design Output

- Data model: [specs/001-mindful-routine-tracker/data-model.md](specs/001-mindful-routine-tracker/data-model.md)
- Contracts: [specs/001-mindful-routine-tracker/contracts/share-payload.schema.json](specs/001-mindful-routine-tracker/contracts/share-payload.schema.json), [specs/001-mindful-routine-tracker/contracts/import-flow.md](specs/001-mindful-routine-tracker/contracts/import-flow.md)
- Quickstart: [specs/001-mindful-routine-tracker/quickstart.md](specs/001-mindful-routine-tracker/quickstart.md)

## Project Structure

### Documentation (this feature)

```text
specs/001-mindful-routine-tracker/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── share-payload.schema.json
│   └── import-flow.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── main.tsx
├── app/
│   ├── AppShell.tsx
│   ├── Router.tsx
│   └── BottomNavBar.tsx
├── db/
│   ├── client.ts
│   ├── schema.ts
│   └── seed.ts
├── repositories/
│   ├── routinesRepository.ts
│   ├── categoriesRepository.ts
│   ├── habitsRepository.ts
│   └── entriesRepository.ts
├── services/
│   ├── timelineService.ts
│   └── sharingService.ts
├── utils/
│   ├── urlCodec.ts
│   ├── pastelPalette.ts
│   └── dateBoundaries.ts
├── components/
│   ├── DashboardView.tsx
│   ├── AllRoutinesView.tsx
│   ├── RoutineWorkspace.tsx
│   ├── CategoryAccordion.tsx
│   ├── HabitRow.tsx
│   ├── ParallelTimelines.tsx
│   ├── DailyGrid.tsx
│   └── WeeklyRibbon.tsx
└── test/
    ├── repositories/
    ├── services/
    └── components/
```

**Structure Decision**: Single SPA with flat component organization and dedicated repository/service layers. `ParallelTimelines` orchestrates `DailyGrid` and `WeeklyRibbon` rendering; URL codec is isolated in a standalone utility.

## Phased Implementation Roadmap

1. Phase 1: Local Database Setup and Core Schema using Dexie stores and seed data.
2. Phase 2: Core Layout and Routing with bottom navigation and view switching.
3. Phase 3: Habit Interactions and Autosave in routine workspace and accordion sections.
4. Phase 4: Parallel Timelines visualization, history rules, and pastel generation.
5. Phase 5: Stateless URL Sharing engine with export, parse, and import confirmation.
6. Phase 6: PWA optimization including service worker, manifest, offline cache, and icons.

## Post-Design Constitution Check

- Stack gate: PASS. Design artifacts rely on TypeScript + React + Vite + Tailwind.
- Component gate: PASS. Planned file map enforces functional modular components.
- Styling gate: PASS. Dedicated pastel design utilities and Tailwind usage.
- Testing gate: PASS. Quickstart and roadmap include Vitest + RTL validation.
- CI gate: PASS. Integration path requires lint and tests before merge.
- Commit control gate: PASS. No automation commits are introduced.

## Complexity Tracking

No constitution violations or exceptional complexity waivers identified.
