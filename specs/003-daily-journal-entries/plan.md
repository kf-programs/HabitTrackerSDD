# Implementation Plan: Daily Journal Entries

**Branch**: `[master]` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-daily-journal-entries/spec.md`

## Summary

Add a routine-level daily journal textarea between timeline and categories, persisted per `(routineId, dayKey)` in IndexedDB, auto-saved on debounce/blur/date change, and reloaded when selected date changes.

## Technical Context

**Language/Version**: TypeScript (React 18, Vite toolchain)

**Primary Dependencies**: React, Dexie (`dexie`, `dexie-react-hooks`), Tailwind CSS

**Storage**: IndexedDB via Dexie (new journal table with composite uniqueness on routine and day)

**Testing**: Vitest + React Testing Library

**Target Platform**: Modern evergreen desktop/mobile browsers supported by current Vite app

**Project Type**: Single-project React web app (offline-first local data)

**Performance Goals**: Date switches render journal content within 1 second for at least 95% of interactions; auto-save does not block typing interactions

**Constraints**: Local-only/private storage; max 2,000 characters per entry; local calendar-day semantics; no auto-commit automation

**Scale/Scope**: One new persistence entity/table, one repository module, one journal UI component, Routine workspace wiring, and targeted tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-research gate status:
- Stack gate: PASS (TypeScript + React + Vite only)
- Component gate: PASS (functional components/Hooks, one component per file)
- Styling gate: PASS (Tailwind utility styling)
- Testing gate: PASS (plan includes Vitest + RTL repository/component tests)
- CI gate: PASS (lint/test verification included in quickstart)
- Commit control gate: PASS (no auto-commit actions in plan)

Post-design gate status:
- Stack gate: PASS (Dexie table extension within existing stack)
- Component gate: PASS (journal editor isolated as dedicated functional component)
- Styling gate: PASS (textarea container remains responsive with Tailwind)
- Testing gate: PASS (tests cover save triggers, date scoping, routine isolation)
- CI gate: PASS (plan requires lint/tests before integration)
- Commit control gate: PASS (manual commit remains required)

## Project Structure

### Documentation (this feature)

```text
specs/003-daily-journal-entries/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── journal-entry-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ParallelTimelines.tsx
│   ├── RoutineWorkspace.tsx
│   └── RoutineJournalEditor.tsx        # new
├── db/
│   ├── client.ts
│   └── schema.ts
├── repositories/
│   └── routineJournalRepository.ts      # new
└── utils/
    └── dateBoundaries.ts

src/test/
├── components/
│   └── RoutineWorkspace.journal.test.tsx # new
└── repositories/
    └── routineJournalRepository.test.ts  # new
```

**Structure Decision**: Keep changes within existing single-project React structure; add one repository and one UI component to preserve modularity and bounded scope.

## Complexity Tracking

No constitution violations identified; complexity exceptions not required.
