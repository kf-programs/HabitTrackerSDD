import { describe, expect, it } from 'vitest';
import { createHabit, deleteHabit, listHabitsForRoutineOnDate } from '../../repositories/habitsRepository';
import { createRoutine } from '../../repositories/routinesRepository';
import { createCategory } from '../../repositories/categoriesRepository';
import { upsertEntry } from '../../repositories/entriesRepository';
import { db } from '../../db/client';

describe('habitsRepository soft delete lifecycle', () => {
  it('sets deletedAt and preserves historical entries', async () => {
    const routine = await createRoutine('Lifecycle Test');
    const category = await createCategory(routine.id, 'Main', 0);
    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Hydrate',
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

    await deleteHabit(habit.id);

    const deleted = await db.habits.get(habit.id);
    const entries = await db.entries.where('habitId').equals(habit.id).toArray();
    const visibleBefore = await listHabitsForRoutineOnDate(routine.id, '2026-06-09');

    expect(deleted?.deletedAt).toBeTruthy();
    expect(entries).toHaveLength(1);
    expect(visibleBefore.some((candidate) => candidate.id === habit.id)).toBe(true);
  });
});
