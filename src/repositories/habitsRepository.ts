import { db } from '../db/client';
import type { HabitRecord } from '../db/schema';

function getNow() {
  return new Date().toISOString();
}

export async function listHabitsForCategory(categoryId: string) {
  return db.habits.where('categoryId').equals(categoryId).toArray();
}

export async function saveHabit(habit: HabitRecord) {
  await db.habits.put(habit);
}

export async function createHabit(input: Omit<HabitRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const now = new Date().toISOString();
  const habit: HabitRecord = {
    ...input,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await db.habits.add(habit);
  return habit;
}

export async function updateHabit(habitId: string, updates: Partial<Pick<HabitRecord, 'title' | 'timeframe' | 'trackingType' | 'measurementUnit' | 'status'>>) {
  await db.habits.update(habitId, {
    ...updates,
    updatedAt: getNow(),
  });
}

export async function listHabitsForRoutine(routineId: string) {
  return db.habits.where('routineId').equals(routineId).toArray();
}

export async function archiveHabit(habitId: string) {
  await db.habits.update(habitId, { status: 'archived' });
}
