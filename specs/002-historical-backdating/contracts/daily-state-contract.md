# Contract: Daily State Save/Log (Upsert)

## Scope
- Operation: Save or update a habit state for a selected calendar day.
- Key identity: habitId + logDate.

## Input Contract
- habitId: string (required)
- logDate: string (YYYY-MM-DD, required)
- completed: boolean | null
- numericValue: number | null
- textValue: string | null

## Behavior Contract
1. Lookup existing record by (habitId, logDate).
2. If found, update mutable state fields and updatedAt.
3. If not found, create new record for that key pair.
4. Return normalized record state.

## Invariants
- Exactly one persisted row exists for each (habitId, logDate).
- Repeated writes are idempotent with respect to record count.
- Last write values are the rendered values for that day.

## Error Contract
- Missing habitId or invalid logDate: reject write and do not mutate storage.
- Unresolvable uniqueness conflict: fail operation and log diagnostic event.
