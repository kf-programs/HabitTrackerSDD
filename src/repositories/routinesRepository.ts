import { db } from '../db/client';
import type { RoutineRecord } from '../db/schema';

export async function listRoutines() {
  return db.routines.orderBy('lastAccessedAt').reverse().toArray();
}

export async function getRoutineById(id: string) {
  return db.routines.get(id);
}

export async function saveRoutine(routine: RoutineRecord) {
  await db.routines.put(routine);
}

export async function deleteRoutine(id: string) {
  await db.transaction('rw', db.categories, db.habits, db.entries, db.routines, async () => {
    const categories = await db.categories.where('routineId').equals(id).toArray();
    const categoryIds = categories.map((category) => category.id);
    const habits = await db.habits.where('routineId').equals(id).toArray();
    const habitIds = habits.map((habit) => habit.id);

    await db.entries.where('habitId').anyOf(habitIds).delete();
    await db.habits.where('id').anyOf(habitIds).delete();
    await db.categories.where('id').anyOf(categoryIds).delete();
    await db.routines.delete(id);
  });
}
