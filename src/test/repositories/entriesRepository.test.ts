import { describe, expect, it, vi } from 'vitest';
import { db } from '../../db/client';
import { getEntryForPeriod, saveEntry, upsertEntry } from '../../repositories/entriesRepository';
import type { EntryRecord } from '../../db/schema';

function buildEntry(): EntryRecord {
  return {
    id: 'entry-1',
    habitId: 'habit-1',
    timeframe: 'daily',
    periodKey: '2026-06-09',
    valueType: 'boolean',
    boolValue: true,
    recordedAt: '2026-06-09T10:00:00.000Z',
    source: 'user',
  };
}

describe('entriesRepository save failure handling', () => {
  it('throws friendly message on quota exceeded', async () => {
    vi.spyOn(db.entries, 'put').mockRejectedValueOnce(new DOMException('quota', 'QuotaExceededError'));

    await expect(saveEntry(buildEntry())).rejects.toThrow('Storage is full. Free some space and retry.');
  });

  it('throws friendly message on unavailable write', async () => {
    vi.spyOn(db.entries, 'put').mockRejectedValueOnce(new DOMException('unavailable', 'InvalidStateError'));

    await expect(saveEntry(buildEntry())).rejects.toThrow('Storage is unavailable right now. Check browser settings and retry.');
  });

  it('keeps a single row for repeated upserts on the same habit/day', async () => {
    const first = await upsertEntry({
      habitId: 'habit-1',
      timeframe: 'daily',
      periodKey: '2026-06-09',
      valueType: 'integer',
      intValue: 1,
      source: 'user',
    });

    const second = await upsertEntry({
      habitId: 'habit-1',
      timeframe: 'daily',
      periodKey: '2026-06-09',
      valueType: 'integer',
      intValue: 3,
      source: 'user',
    });

    const records = await db.entries.where('[habitId+periodKey]').equals(['habit-1', '2026-06-09']).toArray();
    expect(records).toHaveLength(1);
    expect(records[0]?.intValue).toBe(3);
    expect(first.id).toBe(second.id);
  });

  it('rejects non-integer counter values', async () => {
    await expect(
      upsertEntry({
        habitId: 'habit-1',
        timeframe: 'daily',
        periodKey: '2026-06-09',
        valueType: 'integer',
        intValue: 1.5,
        source: 'user',
      }),
    ).rejects.toThrow('Counter value must be an integer.');
  });

  it('reads records by compound habit/period key', async () => {
    await upsertEntry({
      habitId: 'habit-lookup',
      timeframe: 'daily',
      periodKey: '2026-06-10',
      valueType: 'boolean',
      boolValue: true,
      source: 'user',
    });

    const found = await getEntryForPeriod('habit-lookup', '2026-06-10');
    expect(found?.boolValue).toBe(true);
  });
});
