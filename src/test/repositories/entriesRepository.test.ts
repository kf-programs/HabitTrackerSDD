import { describe, expect, it, vi } from 'vitest';
import { db } from '../../db/client';
import { saveEntry } from '../../repositories/entriesRepository';
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
});
