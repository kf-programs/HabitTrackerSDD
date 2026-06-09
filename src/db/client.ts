import Dexie, { type Table } from 'dexie';
import type { CategoryRecord, EntryRecord, HabitRecord, RoutineRecord } from './schema';

export class MindfulRoutineDatabase extends Dexie {
  routines!: Table<RoutineRecord, string>;
  categories!: Table<CategoryRecord, string>;
  habits!: Table<HabitRecord, string>;
  entries!: Table<EntryRecord, string>;

  constructor() {
    super('mindful-routine-tracker');

    this.version(1).stores({
      routines: 'id, status, lastAccessedAt, updatedAt',
      categories: 'id, routineId, orderIndex, updatedAt',
      habits: 'id, routineId, categoryId, timeframe, trackingType, status, updatedAt',
      entries: 'id, habitId, timeframe, periodKey, recordedAt',
    });
  }
}

export const db = new MindfulRoutineDatabase();
