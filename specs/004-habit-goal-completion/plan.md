# Implementation Plan: Habit Goal Completion Controls

**Branch**: `[master]` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-habit-goal-completion/spec.md`

## Summary

Add configurable counter-goal completion rules (operator + integer goal + explicit Set workflow), support editable re-setting of counter values, and make daily/weekly yes-no completion reversible with state-accurate labels while preserving compatibility for legacy counter habits without conditions.

## Technical Context

**Language/Version**: TypeScript (React 18, Vite toolchain)

**Primary Dependencies**: React, Dexie (`dexie`, `dexie-react-hooks`), React Router, Tailwind CSS

**Storage**: IndexedDB via Dexie (`habits` table for counter condition metadata, `entries` table for period values)

**Testing**: Vitest + React Testing Library

**Target Platform**: Modern evergreen desktop/mobile browsers supported by the current Vite app

**Project Type**: Single-project React web app (offline-first local data)

**Performance Goals**: Habit interaction updates (set/toggle) reflect state changes within normal UI interaction latency and preserve current selected-date performance envelopes

**Constraints**: Integer-only counter inputs; no auto-commit automation; local/offline storage semantics must be preserved; existing habit types must not regress

**Scale/Scope**: Habit schema/repository updates, `HabitRow` interaction redesign for counter and yes-no controls, habit creation/edit flow extension, and targeted regression tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-research gate status:
- Stack gate: PASS (TypeScript + React + Vite maintained)
- Component gate: PASS (functional components/Hooks; no class component introduction)
- Styling gate: PASS (Tailwind utility classes continue as primary styling)
- Testing gate: PASS (plan includes Vitest + RTL coverage for new logic/interactions)
- CI gate: PASS (lint/test verification included in quickstart)
- Commit control gate: PASS (no auto-commit step in plan)

Post-design gate status:
- Stack gate: PASS (Dexie schema extension remains inside existing stack)
- Component gate: PASS (changes scoped to existing modular component boundaries)
- Styling gate: PASS (button/input state changes remain Tailwind-based and responsive)
- Testing gate: PASS (tests cover counter configuration, set/edit behavior, condition recompute, yes-no toggling)
- CI gate: PASS (design includes full lint + test gate execution)
- Commit control gate: PASS (manual commit remains required)

## Project Structure

### Documentation (this feature)

```text
specs/004-habit-goal-completion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── habit-completion-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CategoryAccordion.tsx
│   ├── HabitRow.tsx
│   └── RoutineWorkspace.tsx
├── db/
│   ├── client.ts
│   └── schema.ts
├── repositories/
│   ├── entriesRepository.ts
│   └── habitsRepository.ts
└── services/
    └── timelineService.ts

src/test/
├── components/
│   ├── HabitRow.idempotent-updates.test.tsx
│   ├── HabitRow.type-mismatch-fallback.test.tsx
│   └── RoutineWorkspace.test.tsx
└── repositories/
    └── habitsRepository.*.test.ts
```

**Structure Decision**: Keep all implementation inside the existing single-project React architecture, extending existing habit and entry flows rather than introducing new subsystem layers.

## Complexity Tracking

No constitution violations identified; complexity exceptions are not required.
