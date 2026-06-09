# Contract: Import Flow

## Route Contract
- Route: `/import?d=<payload>`
- Method: Browser navigation (GET)
- Input:
  - `d`: URL-safe Base64 compressed string produced by `lz-string`
- Behavior:
  - Decode and validate payload.
  - Show import preview dialog with routine title, description, category count, and habit count.
  - If user confirms, create a new local routine copy.
  - If title collision exists, append suffix (e.g., `(Imported)`, `(Imported 2)`).

## Error Contract
- Invalid payload: show non-destructive error and return to safe screen.
- Unsupported payload version: reject import with explicit message.
- Import cancel: no data mutation.

## Privacy Contract
- Import consumes structure only.
- Any payload containing history fields (`entries`, `timelineTiles`) is invalid and must be rejected.
