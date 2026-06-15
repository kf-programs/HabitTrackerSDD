import { db } from '../db/client';
import type { RoutineJournalEntryRecord } from '../db/schema';

const JOURNAL_MAX_LENGTH = 2000;

function normalizeJournalText(text: string) {
  return text.slice(0, JOURNAL_MAX_LENGTH);
}

async function validateRoutineExists(routineId: string) {
  const routine = await db.routines.get(routineId);
  if (!routine) {
    throw new Error('Routine not found for journal entry.');
  }
}

function mapWriteError(error: unknown): never {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage is full. Free some space and retry.');
    }

    throw new Error('Storage is unavailable right now. Check browser settings and retry.');
  }

  throw error;
}

export async function getRoutineJournalEntry(routineId: string, dayKey: string) {
  return db.routineJournalEntries.where('[routineId+dayKey]').equals([routineId, dayKey]).first();
}

interface UpsertRoutineJournalEntryInput {
  routineId: string;
  dayKey: string;
  text: string;
}

export async function upsertRoutineJournalEntry(input: UpsertRoutineJournalEntryInput) {
  await validateRoutineExists(input.routineId);

  const existing = await getRoutineJournalEntry(input.routineId, input.dayKey);
  const now = new Date().toISOString();
  const text = normalizeJournalText(input.text);

  const record: RoutineJournalEntryRecord = {
    id: existing?.id ?? crypto.randomUUID(),
    routineId: input.routineId,
    dayKey: input.dayKey,
    text,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  try {
    await db.routineJournalEntries.put(record);
    return record;
  } catch (error) {
    mapWriteError(error);
  }
}
