import { describe, expect, it } from 'vitest';
import type { EntryRecord, HabitRecord } from '../../db/schema';
import { buildSelectedDateChecklistItems } from '../../services/timelineService';

function makeHabit(overrides: Partial<HabitRecord> = {}): HabitRecord {
  return {
    id: 'habit-1',
    routineId: 'routine-1',
    categoryId: 'category-1',
    title: 'Hydrate',
    timeframe: 'daily',
    trackingType: 'counter',
    status: 'active',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeEntry(overrides: Partial<EntryRecord> = {}): EntryRecord {
  return {
    id: 'entry-1',
    habitId: 'habit-1',
    timeframe: 'daily',
    periodKey: '2026-06-09',
    valueType: 'integer',
    intValue: 2,
    recordedAt: '2026-06-09T10:00:00.000Z',
    source: 'user',
    ...overrides,
  };
}

describe('timelineService historical read merge', () => {
  it('maps compatible values without fallback', () => {
    const items = buildSelectedDateChecklistItems([makeHabit()], [makeEntry()], new Date('2026-06-09T12:00:00.000Z'));

    expect(items[0]?.fallbackApplied).toBe(false);
    expect(items[0]?.numericValue).toBe(2);
  });

  it('applies deterministic fallback for type mismatch', () => {
    const items = buildSelectedDateChecklistItems(
      [makeHabit()],
      [makeEntry({ valueType: 'boolean', boolValue: true, intValue: undefined })],
      new Date('2026-06-09T12:00:00.000Z'),
    );

    expect(items[0]?.fallbackApplied).toBe(true);
    expect(items[0]?.completed).toBe(true);
    expect(items[0]?.numericValue).toBeUndefined();
  });
});
