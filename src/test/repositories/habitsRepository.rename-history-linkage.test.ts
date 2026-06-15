import { describe, expect, it } from 'vitest';
import { createRoutine } from '../../repositories/routinesRepository';
import { createCategory } from '../../repositories/categoriesRepository';
import { createHabit, updateHabit } from '../../repositories/habitsRepository';
import { upsertEntry } from '../../repositories/entriesRepository';
import { db } from '../../db/client';

describe('habitsRepository rename linkage', () => {
  it('keeps historical entries attached to the same habit id after metadata updates', async () => {
    const routine = await createRoutine('Rename Linkage');
    const category = await createCategory(routine.id, 'Main', 0);
    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Old Title',
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

    await updateHabit(habit.id, { title: 'New Title', trackingType: 'counter' });

    const persistedHabit = await db.habits.get(habit.id);
    const linkedEntries = await db.entries.where('habitId').equals(habit.id).toArray();

    expect(persistedHabit?.title).toBe('New Title');
    expect(linkedEntries).toHaveLength(1);
    expect(linkedEntries[0]?.habitId).toBe(habit.id);
  });
});
