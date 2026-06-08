<!--
Sync Impact Report
- Version change: 1.0.0 -> 2.0.0
- Modified principles:
  - I. React + JavaScript + Vite Baseline -> I. React + TypeScript + Vite Baseline
  - II. Functional Components and Hooks Only -> II. Functional Components and Hooks Only
  - III. Tailwind-First Responsive UI -> III. Tailwind-First Responsive UI
  - IV. Mandatory Automated Testing -> IV. Mandatory Automated Testing
  - V. CI Quality Gates and Human-Controlled Commits -> V. CI Quality Gates and Human-Controlled Commits
- Added sections:
  - None
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ .github/copilot-instructions.md
  - ✅ .specify/templates/commands/*.md (no files present)
- Follow-up TODOs:
  - None
-->

# HabitTrackerSDD Constitution

## Core Principles

### I. React + TypeScript + Vite Baseline
All frontend implementation MUST use TypeScript with React and Vite as the build tool.
New frontend features or modules MUST NOT introduce alternative UI frameworks,
or alternative build tools unless the constitution is amended first.
Rationale: A single baseline reduces maintenance cost and prevents toolchain drift.

### II. Functional Components and Hooks Only
React class components are prohibited. Components MUST be implemented as functional
components using Hooks (for example `useState`, `useEffect`, `useMemo`, `useCallback`) where
stateful or lifecycle behavior is required. Components MUST remain modular, with one component
per file.
Rationale: This enforces a consistent architecture and improves reuse, readability, and testing.

### III. Tailwind-First Responsive UI
UI styling MUST use Tailwind CSS utility classes as the primary styling mechanism.
Layouts MUST be responsive across mobile and desktop breakpoints, and custom CSS MUST be
limited to cases where Tailwind utilities cannot reasonably express the requirement.
Rationale: Utility-first styling accelerates delivery while keeping design behavior explicit.

### IV. Mandatory Automated Testing
Every new feature MUST include automated unit and component tests using Vitest and
React Testing Library. Tests MUST validate core logic, user interactions, and state updates,
and they MUST be runnable in non-interactive CI environments.
Rationale: Required test coverage protects behavior during rapid iteration and refactoring.

### V. CI Quality Gates and Human-Controlled Commits
The repository MUST maintain an automated CI/CD pipeline that runs linting and tests before
integration. Work that fails these checks MUST NOT be integrated. Automation and agents MUST
NOT auto-commit code; changes remain local for human review, manual staging, and manual commit.
Rationale: Quality gates prevent regressions, and manual commits preserve developer control.

## Implementation Standards

- Comments MUST be concise and only explain non-obvious or complex logic.
- File and folder conventions in plans and tasks MUST preserve one-component-per-file structure.
- Any exception to the mandated stack or testing policy MUST be documented in the plan with
	explicit approval before implementation starts.

## Delivery and Review Workflow

- Specifications MUST describe testable user scenarios and include acceptance criteria for
	behavior and state transitions.
- Plans MUST include a constitution compliance check before research and before implementation.
- Tasks MUST include explicit lint and test execution work and identify files to be tested.
- Pull requests and reviews MUST verify constitution compliance, passing CI, and adequate tests
	for new behavior.

## Governance

This constitution is the highest-priority engineering policy for this repository.
All plans, specs, tasks, and implementation guidance MUST comply.

Amendment process:
1. Propose the amendment with impacted principles/sections and rationale.
2. Review dependent templates and guidance docs for required sync updates.
3. Approve and merge the amendment with a version bump justified by semantic versioning.

Versioning policy:
- MAJOR: Breaking governance changes or principle removals/redefinitions.
- MINOR: New principles/sections or materially expanded mandatory guidance.
- PATCH: Wording clarifications, typo fixes, and non-semantic refinements.

Compliance review expectations:
- Every implementation plan and pull request MUST include an explicit constitution check.
- Non-compliance MUST be fixed before integration.

**Version**: 2.0.0 | **Ratified**: 2026-06-07 | **Last Amended**: 2026-06-08
