# Implementation Plan: Habit and Category Deletion

**Branch**: `[005-habit-category-deletion]` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-habit-category-deletion/spec.md`

## Summary

Add habit-level and category-level trash-icon deletion actions in routine workspace, gated by confirmation dialogs matching existing routine delete behavior. Deletion is routine-scoped, preserves historical entries, and is non-destructive on persistence failure (item remains visible with error notification).

## Technical Context

**Language/Version**: TypeScript (React 18 + Vite)

**Primary Dependencies**: React, Dexie (`dexie`, `dexie-react-hooks`), React Router, Tailwind CSS, lucide-react

**Storage**: IndexedDB via Dexie (`categories`, `habits`, `entries` tables)

**Testing**: Vitest + React Testing Library

**Target Platform**: Modern evergreen desktop/mobile browsers supported by current Vite app

**Project Type**: Single-project React web application (offline-first local data)

**Performance Goals**: Deletion confirmation open/close and post-confirm UI update should complete within normal interaction latency without degrading routine workspace rendering behavior

**Constraints**: Routine-scoped deletion only; historical entry preservation; no auto-commit automation; one-component-per-file architecture; confirmation before destructive action

**Scale/Scope**: Update routine workspace UI controls and repository flows for habit/category deletion, plus component/repository tests for confirm, cancel, failure, and historical-preservation behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-research gate status:
- Stack gate: PASS (TypeScript + React + Vite maintained)
- Component gate: PASS (functional components and Hooks only)
- Styling gate: PASS (Tailwind-first styling maintained)
- Testing gate: PASS (plan includes Vitest + RTL for interaction/state paths)
- CI gate: PASS (lint + test verification included in quickstart)
- Commit control gate: PASS (no auto-commit included)

Post-design gate status:
- Stack gate: PASS (no new frameworks/build tools)
- Component gate: PASS (changes scoped to existing modular component files)
- Styling gate: PASS (delete controls/dialog styling remain Tailwind-based and responsive)
- Testing gate: PASS (coverage includes confirm/cancel/success/error/history paths)
- CI gate: PASS (design includes lint and test execution before integration)
- Commit control gate: PASS (manual commit remains required)

## Phase 0: Research Outcome

Research decisions documented in [research.md](./research.md):
- Reuse existing `ConfirmationDialog` for consistency and accessibility
- Preserve historical entries through soft-delete semantics
- Keep category deletion routine-scoped
- Use non-destructive failure behavior (no UI removal on failed persistence)
- Implement category deletion in repository layer with routine-scoped transaction

All technical context unknowns resolved; no `NEEDS CLARIFICATION` markers remain.

## Phase 1: Design Outcome

Design artifacts generated:
- [data-model.md](./data-model.md)
- [contracts/deletion-workspace-contract.md](./contracts/deletion-workspace-contract.md)
- [quickstart.md](./quickstart.md)

Design direction:
- UI actions: add trash icon controls in `CategoryAccordion` header and `HabitRow` action cluster, each to the right of existing Edit controls.
- Orchestration: `RoutineWorkspace` owns delete intent state, selected target, confirm/cancel handlers, and error message propagation.
- Persistence:
  - Habit delete uses existing soft-delete approach (`status='deleted'`, `deletedAt` set).
  - Category delete removes category from active routine view and soft-deletes its habits while preserving entries.
- Failure handling: if any delete persistence call fails, keep item visible and surface user-facing error message.

## Project Structure

### Documentation (this feature)

```text
specs/005-habit-category-deletion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── deletion-workspace-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CategoryAccordion.tsx
│   ├── HabitRow.tsx
│   ├── RoutineWorkspace.tsx
│   └── modals/
│       └── ConfirmationDialog.tsx
├── repositories/
│   ├── categoriesRepository.ts
│   └── habitsRepository.ts
└── db/
    └── schema.ts

src/test/
├── components/
│   ├── CategoryAccordion.test.tsx
│   ├── HabitRow.*.test.tsx
│   └── RoutineWorkspace.test.tsx
└── repositories/
    ├── habitsRepository.soft-delete.test.ts
    └── categoriesRepository.*.test.ts
```

**Structure Decision**: Use the existing single-project React architecture and extend current component/repository boundaries without introducing new layers.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.
