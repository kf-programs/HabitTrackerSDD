import { db } from '../db/client';
import type { HabitRecord } from '../db/schema';
import { compareDayKeys, getDayKey } from '../utils/dateBoundaries';

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
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.habits.add(habit);
  return habit;
}

export async function updateHabit(habitId: string, updates: Partial<Pick<HabitRecord, 'title' | 'timeframe' | 'trackingType' | 'measurementUnit' | 'status'>>) {
  const nextUpdates: Partial<HabitRecord> = {
    ...updates,
    updatedAt: getNow(),
  };

  if (updates.status === 'deleted') {
    nextUpdates.deletedAt = getNow();
  } else if (updates.status) {
    nextUpdates.deletedAt = undefined;
  }

  await db.habits.update(habitId, nextUpdates);
}

export async function listHabitsForRoutine(routineId: string) {
  return db.habits.where('routineId').equals(routineId).toArray();
}

export async function listHabitsForRoutineOnDate(routineId: string, selectedDayKey: string) {
  const habits = await listHabitsForRoutine(routineId);
  return habits.filter((habit) => {
    if (habit.status !== 'deleted') {
      return true;
    }

    if (!habit.deletedAt) {
      return false;
    }

    const deletedDay = getDayKey(new Date(habit.deletedAt));
    return compareDayKeys(selectedDayKey, deletedDay) < 0;
  });
}

export async function archiveHabit(habitId: string) {
  await updateHabit(habitId, { status: 'archived' });
}

export async function deleteHabit(habitId: string) {
  await updateHabit(habitId, { status: 'deleted' });
}
