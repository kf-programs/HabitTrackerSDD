# PRD Checklist: Mindful Routine Tracker

**Purpose**: Validate requirement-writing quality for spec completeness and planning handoff readiness, with mandatory privacy-sharing gates.
**Created**: 2026-06-09
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are all routine lifecycle operations explicitly required (create, edit, pause/resume, archive/delete) and clearly scoped? [Completeness, Spec §FR-005, Spec §FR-018]
- [ ] CHK002 Are category-level requirements complete for create/rename/reorder/delete behavior and their effects on nested habits? [Gap]
- [ ] CHK003 Are share-flow requirements complete across export trigger, clipboard outcome, import preview, confirmation, and cancel paths? [Completeness, Spec §FR-019, Spec §FR-020]

## Requirement Clarity

- [ ] CHK004 Is "last few months" for the daily grid quantified with an exact day-range/window for consistent implementation and testing? [Ambiguity, Spec §FR-011]
- [ ] CHK005 Is the "visually softer/faded" paused-state requirement defined with measurable visual criteria to avoid subjective interpretation? [Clarity, Spec §FR-009]
- [ ] CHK006 Is "random soft pastel" constrained by explicit palette/contrast thresholds so accessibility outcomes are objectively verifiable? [Clarity, Spec §FR-013]

## Requirement Consistency

- [ ] CHK007 Do period-boundary requirements remain internally consistent across daily local-midnight reset and Sunday-start weekly aggregation? [Consistency, Spec §FR-025, Spec §FR-026]
- [ ] CHK008 Are completion semantics consistent between Weekly Yes/No first-check behavior and weekly ribbon lighting behavior? [Consistency, Spec §FR-014, Spec §FR-023]

## Acceptance Criteria Quality

- [ ] CHK009 Can every functional requirement map to at least one acceptance scenario or explicit edge-case criterion without orphaned requirements? [Traceability, Spec §FR-001..FR-026]
- [ ] CHK010 Are non-functional success targets measurable without implementation dependence (timing, offline availability, privacy exclusion fidelity)? [Measurability, Spec §SC-002, Spec §SC-003, Spec §SC-004]

## Scenario and Edge Coverage

- [ ] CHK011 Are recovery requirements defined for import interruption/failure states (invalid payload, cancel, duplicate title) including expected user outcomes? [Coverage, Spec §FR-021, Spec §FR-024]
- [ ] CHK012 Are boundary requirements defined for storage pressure conditions, including write-failure handling and user-safe retry expectations? [Coverage, Edge Case]

## Privacy and Sharing Gate (Mandatory)

- [ ] CHK013 Do requirements explicitly guarantee that all personal completion/history artifacts are excluded from share payloads across all habit types and timeline artifacts? [Completeness, Spec §FR-019]
- [ ] CHK014 Is an explicit validation requirement present to prove privacy exclusion on export and import paths before release readiness? [Gap, Traceability]

## Dependencies and Assumptions

- [ ] CHK015 Are assumptions about local storage availability, clipboard behavior, and offline PWA installation validated with fallback requirements when assumptions fail? [Assumption, Spec §Assumptions]
- [ ] CHK016 Are external dependency boundaries documented for link opening/import parsing without implying any backend persistence dependency? [Dependency, Spec §FR-002, Spec §FR-020]
