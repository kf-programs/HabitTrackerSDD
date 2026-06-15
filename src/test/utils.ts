import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { HabitRecord } from '../db/schema';
import { getDayKey, shiftDayKey } from '../utils/dateBoundaries';

export function renderWithProviders(ui: ReactElement) {
  return render(ui);
}

export function makeDayKey(offsetDays = 0, from = new Date()) {
  const base = getDayKey(from);
  return shiftDayKey(base, offsetDays);
}

export function buildHabitLifecycleFixture(overrides: Partial<HabitRecord> = {}): HabitRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    routineId: 'routine-1',
    categoryId: 'category-1',
    title: 'Fixture Habit',
    timeframe: 'daily',
    trackingType: 'yesno',
    status: 'active',
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
