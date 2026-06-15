import Dexie, { type Table } from 'dexie';
import type { CategoryRecord, EntryRecord, HabitRecord, RoutineJournalEntryRecord, RoutineRecord } from './schema';

export class MindfulRoutineDatabase extends Dexie {
  routines!: Table<RoutineRecord, string>;
  categories!: Table<CategoryRecord, string>;
  habits!: Table<HabitRecord, string>;
  entries!: Table<EntryRecord, string>;
  routineJournalEntries!: Table<RoutineJournalEntryRecord, string>;

  constructor() {
    super('mindful-routine-tracker');

    this.version(1).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, recordedAt',
    });

    this.version(2).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, [habitId+periodKey], recordedAt',
    });

    this.version(3).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, [habitId+periodKey], recordedAt',
    });

    this.version(4).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, deletedAt, createdAt, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, &[habitId+periodKey], recordedAt',
    });

    this.version(5).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, deletedAt, createdAt, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, &[habitId+periodKey], recordedAt',
      routineJournalEntries: 'id, routineId, dayKey, &[routineId+dayKey], updatedAt',
    });
  }
}

export const db = new MindfulRoutineDatabase();
