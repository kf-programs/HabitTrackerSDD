import { describe, expect, it } from 'vitest';
import { createRoutine } from '../../repositories/routinesRepository';
import { createCategory } from '../../repositories/categoriesRepository';
import { createHabit, updateHabit } from '../../repositories/habitsRepository';
import { db } from '../../db/client';

describe('habitsRepository counter goal metadata', () => {
  it('saves and retrieves counter goal operator/value metadata', async () => {
    const routine = await createRoutine('Counter Goal Routine');
    const category = await createCategory(routine.id, 'Focus', 0);

    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Steps',
      timeframe: 'daily',
      trackingType: 'counter',
      measurementUnit: undefined,
      counterGoalOperator: 'gt',
      counterGoalValue: 8,
    });

    const persisted = await db.habits.get(habit.id);
    expect(persisted?.counterGoalOperator).toBe('gt');
    expect(persisted?.counterGoalValue).toBe(8);
  });

  it('updates an existing counter goal and rejects decimal values', async () => {
    const routine = await createRoutine('Counter Goal Update Routine');
    const category = await createCategory(routine.id, 'Focus', 0);

    const habit = await createHabit({
      routineId: routine.id,
      categoryId: category.id,
      title: 'Steps',
      timeframe: 'daily',
      trackingType: 'counter',
      measurementUnit: undefined,
      counterGoalOperator: 'gt',
      counterGoalValue: 8,
    });

    await updateHabit(habit.id, { counterGoalOperator: 'eq', counterGoalValue: 10 });
    const updated = await db.habits.get(habit.id);
    expect(updated?.counterGoalOperator).toBe('eq');
    expect(updated?.counterGoalValue).toBe(10);

    await expect(updateHabit(habit.id, { counterGoalValue: 10.5 })).rejects.toThrow('Counter goal must be an integer value.');
  });
});