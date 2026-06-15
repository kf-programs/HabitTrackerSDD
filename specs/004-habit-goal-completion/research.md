# Research: Habit Goal Completion Controls

## Decision 1: Counter goals use integer-only condition inputs
- Decision: Counter goal and set value inputs accept integers only; decimals are rejected.
- Rationale: Clarified requirement reduces ambiguity, keeps comparison logic deterministic, and aligns with current `EntryRecord.intValue` storage for counters.
- Alternatives considered:
  - Decimal support with exact comparison: more flexible but adds parsing/validation complexity and precision edge cases.
  - Decimal support with rounding: simple but can produce surprising completion outcomes near thresholds.

## Decision 2: Counter completion uses explicit Set action with re-evaluation on condition changes
- Decision: Counter habits use a user-entered integer plus a `Set` action; completion is evaluated immediately on set and re-evaluated when goal/operator changes.
- Rationale: Matches requested UX (set button + editable value) and ensures displayed completion state is always consistent with latest condition.
- Alternatives considered:
  - Live evaluation on every keystroke: more reactive but causes noisy state churn and accidental completion while typing.
  - Re-evaluate only after pressing Set again when condition changes: simpler implementation but leaves stale completion state visible.

## Decision 3: Legacy counter habits without condition remain editable but cannot complete
- Decision: Existing counter habits missing condition metadata stay visible/editable, but completion is disabled until a valid goal/operator is configured.
- Rationale: Preserves backward compatibility and avoids silent default rules that could incorrectly mark habits complete.
- Alternatives considered:
  - Auto-migrate to `equals 1`: fast but behavior-changing and potentially incorrect.
  - Block rendering until configured: too disruptive and harms continuity for existing users.

## Decision 4: Yes/No completion becomes reversible for both daily and weekly habits
- Decision: Daily and weekly yes/no controls toggle complete/incomplete; labels are state-accurate (`Mark complete`/`Mark incomplete` for daily, `Mark done this week`/`Mark incomplete` for weekly).
- Rationale: Fixes current one-way weekly interaction bug and aligns both cadences with recoverable user actions.
- Alternatives considered:
  - Keep weekly one-way completion (`Done this week` non-clickable): preserves status quo but fails user correction workflow.
  - Use cadence-agnostic labels for all habits: workable but loses helpful weekly context.

## Decision 5: Persist counter condition on habit record and continue using entries for recorded values
- Decision: Add condition fields to habit metadata while continuing to store recorded values in entries (`intValue`) keyed by habit and period.
- Rationale: Fits existing repository/data flow (habit config + per-period entries), minimizes migration footprint, and supports routine/day/week rendering patterns already in place.
- Alternatives considered:
  - Store condition in a separate table: more normalized but introduces extra joins and migration complexity for limited scope.
  - Store latest set value on habit record only: loses period-specific tracking behavior expected by existing checklist model.