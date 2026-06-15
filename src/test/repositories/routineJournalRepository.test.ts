import { describe, expect, it } from 'vitest';
import { db } from '../../db/client';
import { getRoutineJournalEntry, upsertRoutineJournalEntry } from '../../repositories/routineJournalRepository';

async function seedRoutine(id: string) {
  const now = new Date().toISOString();
  await db.routines.add({
    id,
    title: `Routine ${id}`,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
  });
}

describe('routineJournalRepository', () => {
  it('creates then updates a single row for the same routine/day', async () => {
    await seedRoutine('routine-1');

    const first = await upsertRoutineJournalEntry({
      routineId: 'routine-1',
      dayKey: '2026-06-15',
      text: 'first',
    });

    const second = await upsertRoutineJournalEntry({
      routineId: 'routine-1',
      dayKey: '2026-06-15',
      text: 'second',
    });

    const rows = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-1', '2026-06-15']).toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.text).toBe('second');
    expect(first.id).toBe(second.id);
    expect(second.createdAt).toBe(first.createdAt);
  });

  it('isolates same-day journal entries by routine id', async () => {
    await seedRoutine('routine-a');
    await seedRoutine('routine-b');

    await upsertRoutineJournalEntry({
      routineId: 'routine-a',
      dayKey: '2026-06-15',
      text: 'A note',
    });
    await upsertRoutineJournalEntry({
      routineId: 'routine-b',
      dayKey: '2026-06-15',
      text: 'B note',
    });

    const noteA = await getRoutineJournalEntry('routine-a', '2026-06-15');
    const noteB = await getRoutineJournalEntry('routine-b', '2026-06-15');

    expect(noteA?.text).toBe('A note');
    expect(noteB?.text).toBe('B note');
  });

  it('enforces unique key behavior by routineId+dayKey', async () => {
    await seedRoutine('routine-1');

    await upsertRoutineJournalEntry({ routineId: 'routine-1', dayKey: '2026-06-15', text: 'one' });
    await upsertRoutineJournalEntry({ routineId: 'routine-1', dayKey: '2026-06-15', text: 'two' });
    await upsertRoutineJournalEntry({ routineId: 'routine-1', dayKey: '2026-06-16', text: 'three' });

    const all = await db.routineJournalEntries.toArray();
    expect(all).toHaveLength(2);
  });
});
