import { describe, expect, it } from 'vitest';
import { db } from '../../db/client';
import { createRoutine } from '../../repositories/routinesRepository';
import { createCategory, deleteCategoryForRoutine } from '../../repositories/categoriesRepository';
import { createHabit } from '../../repositories/habitsRepository';
import { upsertEntry } from '../../repositories/entriesRepository';

describe('categoriesRepository deleteCategoryForRoutine', () => {
  it('hard-deletes category record and soft-deletes same-routine habits while preserving entries', async () => {
    const routine = await createRoutine('Primary Routine');
    const category = await createCategory(routine.id, 'Focus', 0);

    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Deep work',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    await upsertEntry({
      habitId: habit.id,
      timeframe: 'daily',
      periodKey: '2026-06-10',
      valueType: 'boolean',
      boolValue: true,
      source: 'user',
    });

    await deleteCategoryForRoutine(category.id, routine.id);

    expect(await db.categories.get(category.id)).toBeUndefined();

    const deletedHabit = await db.habits.get(habit.id);
    expect(deletedHabit?.status).toBe('deleted');
    expect(deletedHabit?.deletedAt).toBeTruthy();

    const preservedEntries = await db.entries.where('habitId').equals(habit.id).toArray();
    expect(preservedEntries).toHaveLength(1);
  });

  it('does not mutate categories or habits in other routines', async () => {
    const routineA = await createRoutine('Routine A');
    const routineB = await createRoutine('Routine B');

    const categoryA = await createCategory(routineA.id, 'Shared Name', 0);
    const categoryB = await createCategory(routineB.id, 'Shared Name', 0);

    const habitA = await createHabit({
      routineId: routineA.id,
      categoryId: categoryA.id,
      title: 'Routine A habit',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    const habitB = await createHabit({
      routineId: routineB.id,
      categoryId: categoryB.id,
      title: 'Routine B habit',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    await deleteCategoryForRoutine(categoryA.id, routineA.id);

    expect(await db.categories.get(categoryA.id)).toBeUndefined();
    expect(await db.categories.get(categoryB.id)).toBeTruthy();

    expect((await db.habits.get(habitA.id))?.status).toBe('deleted');
    expect((await db.habits.get(habitB.id))?.status).toBe('active');
  });

  it('throws when category is not in the requested routine', async () => {
    const routineA = await createRoutine('Routine A');
    const routineB = await createRoutine('Routine B');
    const categoryA = await createCategory(routineA.id, 'Focus', 0);

    await expect(deleteCategoryForRoutine(categoryA.id, routineB.id)).rejects.toThrow(
      'Category not found for this routine.',
    );

    expect(await db.categories.get(categoryA.id)).toBeTruthy();
  });
});
