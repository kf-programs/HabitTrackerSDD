import { db } from '../db/client';
import type { EntryRecord } from '../db/schema';
import { getDayKey } from '../utils/dateBoundaries';

export async function listEntriesForHabit(habitId: string) {
  return db.entries.where('habitId').equals(habitId).toArray();
}

export async function saveEntry(entry: EntryRecord) {
  try {
    await db.entries.put(entry);
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage is full. Free some space and retry.');
      }

      throw new Error('Storage is unavailable right now. Check browser settings and retry.');
    }
    throw error;
  }
}

export async function getEntryForPeriod(habitId: string, periodKey: string) {
  return db.entries.where('[habitId+periodKey]').equals([habitId, periodKey]).first();
}

export async function upsertEntry(input: Omit<EntryRecord, 'id' | 'recordedAt'>) {
  const existing = await getEntryForPeriod(input.habitId, input.periodKey);

  if (input.timeframe === 'weekly' && input.valueType === 'boolean' && existing?.boolValue === true) {
    return existing;
  }

  const entry: EntryRecord = {
    ...input,
    logDate: input.timeframe === 'daily' ? getDayKey(new Date(`${input.periodKey}T12:00:00`)) : undefined,
    id: existing?.id || crypto.randomUUID(),
    recordedAt: new Date().toISOString(),
  };

  try {
    await saveEntry(entry);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ConstraintError')) {
      const conflict = await getEntryForPeriod(input.habitId, input.periodKey);
      if (conflict) {
        const patched: EntryRecord = {
          ...entry,
          id: conflict.id,
        };
        await saveEntry(patched);
        return patched;
      }
    }
    throw error;
  }
  return entry;
}
