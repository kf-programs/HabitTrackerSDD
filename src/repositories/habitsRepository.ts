import { db } from '../db/client';
import type { HabitRecord } from '../db/schema';

export async function listHabitsForCategory(categoryId: string) {
  return db.habits.where('categoryId').equals(categoryId).toArray();
}

export async function saveHabit(habit: HabitRecord) {
  await db.habits.put(habit);
}

export async function archiveHabit(habitId: string) {
  await db.habits.update(habitId, { status: 'archived' });
}
