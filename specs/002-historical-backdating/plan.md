# Implementation Plan: Historical Navigation and Backdating

**Branch**: `006-new-spec-request` | **Date**: 2026-06-15 | **Spec**: [specs/002-historical-backdating/spec.md](specs/002-historical-backdating/spec.md)

**Input**: Feature specification from [specs/002-historical-backdating/spec.md](specs/002-historical-backdating/spec.md)

## Summary

Implement historical date navigation with state-based daily logging so each habit has exactly one mutable record per day. The feature introduces lifecycle-safe soft deletion (`deletedAt` semantics), composite habit/date uniqueness, idempotent upsert writes, and date-aware read/merge behavior that renders habits valid for a selected day including deleted-in-future history. Historical type-mismatch values degrade deterministically to checkbox-complete without counter display.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x

**Primary Dependencies**: React, Vite, Tailwind CSS, Dexie, dexie-react-hooks, React Router

**Storage**: IndexedDB via Dexie with composite uniqueness at repository layer and schema index support

**Testing**: Vitest + React Testing Library (component and repository/service tests)

**Target Platform**: Mobile-first PWA in modern evergreen browsers

**Project Type**: Frontend-only single-page web application

**Performance Goals**: Date switch and checklist render for a selected day in <= 1 second for p95 local interactions

**Constraints**: Offline-first behavior, one component per file, no auto-commit automation, deterministic fallback for legacy data mismatches

**Scale/Scope**: Single-user local app; hundreds of habits and dense daily state updates across timeline windows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Stack gate: PASS. Solution remains TypeScript + React + Vite.
- Component gate: PASS. Changes stay within functional components/hooks and existing modular structure.
- Styling gate: PASS. Checklist continuity keeps Tailwind-based responsive UI.
- Testing gate: PASS. Plan includes repository/service + UI tests for interactions and state transitions.
- CI gate: PASS. Lint/test/build validation remains mandatory before integration.
- Commit control gate: PASS. No automatic commits are introduced.

## Phase 0: Research Output

See [specs/002-historical-backdating/research.md](specs/002-historical-backdating/research.md).

## Phase 1: Design Output

- Data model: [specs/002-historical-backdating/data-model.md](specs/002-historical-backdating/data-model.md)
- Contracts:
  - [specs/002-historical-backdating/contracts/daily-state-contract.md](specs/002-historical-backdating/contracts/daily-state-contract.md)
  - [specs/002-historical-backdating/contracts/date-checklist-read-contract.md](specs/002-historical-backdating/contracts/date-checklist-read-contract.md)
- Quickstart: [specs/002-historical-backdating/quickstart.md](specs/002-historical-backdating/quickstart.md)

## Project Structure

### Documentation (this feature)

```text
specs/002-historical-backdating/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── daily-state-contract.md
│   └── date-checklist-read-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── AppShell.tsx
│   ├── BottomNavBar.tsx
│   └── Router.tsx
├── components/
│   ├── DailyGrid.tsx
│   ├── HabitRow.tsx
│   ├── ParallelTimelines.tsx
│   └── RoutineWorkspace.tsx
├── db/
│   ├── client.ts
│   └── schema.ts
├── repositories/
│   ├── entriesRepository.ts
│   └── habitsRepository.ts
├── services/
│   └── timelineService.ts
└── utils/
    └── dateBoundaries.ts

src/test/
├── components/
├── repositories/
└── services/
```

**Structure Decision**: Continue with the existing single-SPA frontend architecture, implementing data integrity and lifecycle logic in repository/service layers while keeping date selection and rendering behavior in focused UI components.

## Post-Design Constitution Check

- Stack gate: PASS. Design artifacts stay in the approved frontend stack.
- Component gate: PASS. Plan work remains hook-based and modular.
- Styling gate: PASS. No divergence from Tailwind-first responsive UI.
- Testing gate: PASS. Contracts and quickstart require automated coverage for upsert, soft-delete visibility, and fallback rendering.
- CI gate: PASS. Local/CI lint+test+build checks remain required.
- Commit control gate: PASS. Workflow keeps commits human-controlled.

## Complexity Tracking

No constitution violations requiring waivers.
