import { db } from '../db/client';
import type { EntryRecord } from '../db/schema';

export async function listEntriesForHabit(habitId: string) {
  return db.entries.where('habitId').equals(habitId).toArray();
}

export async function saveEntry(entry: EntryRecord) {
  try {
    await db.entries.put(entry);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage is full. Free some space and retry.');
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
    id: existing?.id || crypto.randomUUID(),
    recordedAt: new Date().toISOString(),
  };

  await saveEntry(entry);
  return entry;
}
