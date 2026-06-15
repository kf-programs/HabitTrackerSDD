import { describe, expect, it } from 'vitest';
import { db } from '../../db/client';
import { listHabitsForRoutineOnDate } from '../../repositories/habitsRepository';

describe('habitsRepository date filtering', () => {
  it('includes deleted habits for days before deletedAt and excludes on/after deleted day', async () => {
    await db.habits.add({
      id: 'habit-visible-before-delete',
      routineId: 'routine-1',
      categoryId: 'category-1',
      title: 'Stretch',
      timeframe: 'daily',
      trackingType: 'yesno',
      status: 'deleted',
      deletedAt: '2026-06-10T10:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-10T10:00:00.000Z',
    });

    const beforeDelete = await listHabitsForRoutineOnDate('routine-1', '2026-06-09');
    const onDelete = await listHabitsForRoutineOnDate('routine-1', '2026-06-10');

    expect(beforeDelete.some((habit) => habit.id === 'habit-visible-before-delete')).toBe(true);
    expect(onDelete.some((habit) => habit.id === 'habit-visible-before-delete')).toBe(false);
  });
});
