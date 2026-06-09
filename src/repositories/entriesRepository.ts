import { db } from '../db/client';
import type { EntryRecord } from '../db/schema';

export async function listEntriesForHabit(habitId: string) {
  return db.entries.where('habitId').equals(habitId).toArray();
}

export async function saveEntry(entry: EntryRecord) {
  await db.entries.put(entry);
}
