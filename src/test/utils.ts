import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { CategoryRecord, HabitRecord, RoutineRecord } from '../db/schema';
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

export function buildRoutineFixture(overrides: Partial<RoutineRecord> = {}): RoutineRecord {
  const now = new Date().toISOString();
  return {
    id: 'routine-1',
    title: 'Fixture Routine',
    description: 'Fixture description',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    ...overrides,
  };
}

export function buildCategoryFixture(overrides: Partial<CategoryRecord> = {}): CategoryRecord {
  const now = new Date().toISOString();
  return {
    id: 'category-1',
    routineId: 'routine-1',
    name: 'Fixture Category',
    description: 'Fixture category description',
    orderIndex: 0,
    isExpandedDefault: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
