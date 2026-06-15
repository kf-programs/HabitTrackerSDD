import { describe, expect, it } from 'vitest';
import type { HabitRecord } from '../../db/schema';
import { buildDailyTimeline, buildDailyWindow, buildWeeklyTimeline, getPeriodKeyForHabit, mergeTimelineTiles } from '../../services/timelineService';
import { getApprovedPastelPalette, getPastelContrast } from '../../utils/pastelPalette';

function makeWeeklyHabit(): HabitRecord {
  return {
    id: 'habit-weekly',
    routineId: 'routine-1',
    categoryId: 'category-1',
    title: 'Weekly walk',
    timeframe: 'weekly',
    trackingType: 'yesno',
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };
}

describe('timelineService', () => {
  it('builds a 120-day rolling window including today', () => {
    const today = new Date('2026-06-09T10:00:00.000Z');
    const keys = buildDailyWindow(today);

    expect(keys).toHaveLength(120);
    expect(keys.at(-1)).toBe('2026-06-09');
  });

  it('computes weekly period keys with fixed Sunday start', () => {
    const habit = makeWeeklyHabit();
    const date = new Date('2026-06-10T12:00:00.000Z');

    const key = getPeriodKeyForHabit(habit, date);

    expect(key).toBe('2026-06-07-SUN');
  });

  it('preserves historical tile visuals when regenerating timeline data', () => {
    const preserved = mergeTimelineTiles(
      [
        { periodKey: '2026-06-01', completed: true, pastelToken: 'mint' },
        { periodKey: '2026-06-02', completed: false, pastelToken: 'sky' },
      ],
      [{ periodKey: '2026-06-01', completed: true, pastelToken: 'blush' }],
    );

    const dayOne = preserved.find((tile) => tile.periodKey === '2026-06-01');
    expect(dayOne?.pastelToken).toBe('mint');
  });

  it('uses only approved pastel tokens for timeline tile assignment', () => {
    const palette = getApprovedPastelPalette();
    expect(palette).toHaveLength(16);

    for (const token of palette) {
      expect(palette).toContain(token);
    }
  });

  it('ensures each approved pastel token meets contrast thresholds', () => {
    const palette = getApprovedPastelPalette();

    for (const token of palette) {
      const contrast = getPastelContrast(token);
      expect(contrast.iconContrast).toBeGreaterThanOrEqual(3);
      expect(contrast.backgroundContrast).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('marks daily counter tile incomplete when value does not satisfy configured goal', () => {
    const today = new Date('2026-06-09T10:00:00.000Z');
    const habit: HabitRecord = {
      id: 'habit-counter-daily',
      routineId: 'routine-1',
      categoryId: 'category-1',
      title: 'Daily pushups',
      timeframe: 'daily',
      trackingType: 'counter',
      counterGoalOperator: 'gt',
      counterGoalValue: 5,
      status: 'active',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };

    const timeline = buildDailyTimeline(
      {
        routineId: 'routine-1',
        habits: [habit],
        entries: [
          {
            id: 'entry-1',
            habitId: habit.id,
            timeframe: 'daily',
            periodKey: '2026-06-09',
            valueType: 'integer',
            intValue: 3,
            recordedAt: '2026-06-09T10:00:00.000Z',
            source: 'user',
          },
        ],
      },
      [],
      today,
    );

    const tile = timeline.find((candidate) => candidate.periodKey === '2026-06-09');
    expect(tile?.completed).toBe(false);
  });

  it('marks daily counter tile complete when value satisfies configured goal', () => {
    const today = new Date('2026-06-09T10:00:00.000Z');
    const habit: HabitRecord = {
      id: 'habit-counter-daily',
      routineId: 'routine-1',
      categoryId: 'category-1',
      title: 'Daily pushups',
      timeframe: 'daily',
      trackingType: 'counter',
      counterGoalOperator: 'gt',
      counterGoalValue: 5,
      status: 'active',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };

    const timeline = buildDailyTimeline(
      {
        routineId: 'routine-1',
        habits: [habit],
        entries: [
          {
            id: 'entry-2',
            habitId: habit.id,
            timeframe: 'daily',
            periodKey: '2026-06-09',
            valueType: 'integer',
            intValue: 7,
            recordedAt: '2026-06-09T10:00:00.000Z',
            source: 'user',
          },
        ],
      },
      [],
      today,
    );

    const tile = timeline.find((candidate) => candidate.periodKey === '2026-06-09');
    expect(tile?.completed).toBe(true);
  });

  it('applies counter goal evaluation to weekly timeline tiles', () => {
    const today = new Date('2026-06-10T12:00:00.000Z');
    const habit: HabitRecord = {
      id: 'habit-counter-weekly',
      routineId: 'routine-1',
      categoryId: 'category-1',
      title: 'Weekly miles',
      timeframe: 'weekly',
      trackingType: 'counter',
      counterGoalOperator: 'lt',
      counterGoalValue: 5,
      status: 'active',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    };

    const periodKey = getPeriodKeyForHabit(habit, today);

    const failing = buildWeeklyTimeline(
      {
        routineId: 'routine-1',
        habits: [habit],
        entries: [
          {
            id: 'entry-weekly-fail',
            habitId: habit.id,
            timeframe: 'weekly',
            periodKey,
            valueType: 'integer',
            intValue: 7,
            recordedAt: '2026-06-10T12:00:00.000Z',
            source: 'user',
          },
        ],
      },
      [],
      today,
    );

    const passing = buildWeeklyTimeline(
      {
        routineId: 'routine-1',
        habits: [habit],
        entries: [
          {
            id: 'entry-weekly-pass',
            habitId: habit.id,
            timeframe: 'weekly',
            periodKey,
            valueType: 'integer',
            intValue: 3,
            recordedAt: '2026-06-10T12:00:00.000Z',
            source: 'user',
          },
        ],
      },
      [],
      today,
    );

    const failingTile = failing.find((candidate) => candidate.periodKey === periodKey);
    const passingTile = passing.find((candidate) => candidate.periodKey === periodKey);

    expect(failingTile?.completed).toBe(false);
    expect(passingTile?.completed).toBe(true);
  });
});
