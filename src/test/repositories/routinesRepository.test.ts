import { describe, expect, it } from 'vitest';
import { createRoutine, deleteRoutine, listRoutines } from '../../repositories/routinesRepository';
import { createCategory } from '../../repositories/categoriesRepository';
import { createHabit } from '../../repositories/habitsRepository';
import { upsertEntry } from '../../repositories/entriesRepository';
import { db } from '../../db/client';

describe('routinesRepository', () => {
  it('creates routine, category, habit, and persists them', async () => {
    const routine = await createRoutine('Evening Reset', 'Wind down with intention');
    const category = await createCategory(routine.id, 'Body', 0);
    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Read for 10 minutes',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    const routines = await listRoutines();
    const categories = await db.categories.where('routineId').equals(routine.id).toArray();
    const habits = await db.habits.where('routineId').equals(routine.id).toArray();

    expect(routines.some((item) => item.id === routine.id)).toBe(true);
    expect(categories[0]?.id).toBe(category.id);
    expect(habits[0]?.id).toBe(habit.id);
  });

  it('deletes a routine and cascades categories, habits, and entries', async () => {
    const routine = await createRoutine('Test Routine');
    const category = await createCategory(routine.id, 'Focus', 0);
    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Breathing',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    await upsertEntry({
      habitId: habit.id,
      timeframe: 'daily',
      periodKey: '2026-06-09',
      valueType: 'boolean',
      boolValue: true,
      source: 'user',
    });

    await deleteRoutine(routine.id);

    const deletedRoutine = await db.routines.get(routine.id);
    const categories = await db.categories.where('routineId').equals(routine.id).count();
    const habits = await db.habits.where('routineId').equals(routine.id).count();
    const entries = await db.entries.where('habitId').equals(habit.id).count();

    expect(deletedRoutine).toBeUndefined();
    expect(categories).toBe(0);
    expect(habits).toBe(0);
    expect(entries).toBe(0);
  });
});
