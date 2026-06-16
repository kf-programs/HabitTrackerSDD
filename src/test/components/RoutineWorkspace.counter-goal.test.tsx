import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { getDayKey } from '../../utils/dateBoundaries';

async function addCounterHabit(goalOperator: 'gt' | 'lt' | 'eq', goalValue: number) {
  const now = new Date().toISOString();
  await db.habits.add({
    id: 'habit-steps',
    routineId: 'routine-morning',
      categoryId: 'category-hydration',
    title: 'Steps',
    timeframe: 'daily',
    trackingType: 'counter',
    counterGoalOperator: goalOperator,
    counterGoalValue: goalValue,
    status: 'active',
    deletedAt: undefined,
    createdAt: now,
    updatedAt: now,
  });
}

describe('RoutineWorkspace counter goal behavior', () => {
  it('renders and persists an editable counter goal from routine view', async () => {
    await seedDatabase();
    await addCounterHabit('gt', 8);

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Goal: > 8')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Edit goal' }));
    await user.clear(screen.getByLabelText('Edit counter goal value'));
    await user.type(screen.getByLabelText('Edit counter goal value'), '10');
    await user.click(screen.getByRole('button', { name: 'Save goal' }));

    await waitFor(async () => {
      const habit = await db.habits.get('habit-steps');
      expect(habit?.counterGoalOperator).toBe('gt');
      expect(habit?.counterGoalValue).toBe(10);
    });
  });

  it('marks counter habits complete when Set value satisfies the configured goal', async () => {
    await seedDatabase();
    await addCounterHabit('gt', 2);

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText('Steps counter value'));
    await user.type(screen.getByLabelText('Steps counter value'), '3');
    await user.click(screen.getByRole('button', { name: 'Set' }));

    await waitFor(() => {
      expect(screen.getByText('Steps')).toHaveClass('line-through');
    });
  });

  it('deletes persisted counter entry when Unset is clicked', async () => {
    await seedDatabase();
    await addCounterHabit('gt', 2);

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText('Steps counter value'));
    await user.type(screen.getByLabelText('Steps counter value'), '3');
    await user.click(screen.getByRole('button', { name: 'Set' }));

    await waitFor(async () => {
      const stored = await db.entries.where('habitId').equals('habit-steps').toArray();
      expect(stored.length).toBe(1);
    });

    await user.click(await screen.findByRole('button', { name: 'Unset' }));

    await waitFor(async () => {
      const stored = await db.entries.where('habitId').equals('habit-steps').toArray();
      expect(stored.length).toBe(0);
    });
  });

  it('recomputes completion immediately when an existing counter goal changes', async () => {
    await seedDatabase();
    await addCounterHabit('gt', 10);
    const selectedDayKey = getDayKey();

    await db.entries.add({
      id: 'entry-counter-existing',
      habitId: 'habit-steps',
      timeframe: 'daily',
      periodKey: selectedDayKey,
      valueType: 'integer',
      intValue: 9,
      recordedAt: new Date().toISOString(),
      source: 'user',
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Edit goal' }));
    await user.clear(screen.getByLabelText('Edit counter goal value'));
    await user.type(screen.getByLabelText('Edit counter goal value'), '8');
    await user.click(screen.getByRole('button', { name: 'Save goal' }));

    await waitFor(() => {
      expect(screen.getByText('Steps')).toHaveClass('line-through');
    });
  });

  it('keeps weekly yes/no habits reversible after completion', async () => {
    await seedDatabase();
    const now = new Date().toISOString();
    await db.habits.add({
      id: 'habit-weekly-reflect',
      routineId: 'routine-morning',
      categoryId: 'category-hydration',
      title: 'Reflect',
      timeframe: 'weekly',
      trackingType: 'yesno',
      status: 'active',
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Mark done this week' }));
    expect(await screen.findByRole('button', { name: 'Mark incomplete' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark incomplete' }));
    expect(await screen.findByRole('button', { name: 'Mark done this week' })).toBeInTheDocument();
  });

  it('keeps legacy counter habits editable but not completable without a configured goal', async () => {
    await seedDatabase();
    const now = new Date().toISOString();
    await db.habits.add({
      id: 'habit-legacy-counter',
      routineId: 'routine-morning',
      categoryId: 'category-hydration',
      title: 'Legacy Counter',
      timeframe: 'daily',
      trackingType: 'counter',
      status: 'active',
      deletedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText('Legacy Counter counter value'));
    await user.type(screen.getByLabelText('Legacy Counter counter value'), '5');
    await user.click(screen.getByRole('button', { name: 'Set' }));

    expect(screen.getByText('Goal not configured')).toBeInTheDocument();
    expect(screen.getByText('Legacy Counter')).not.toHaveClass('line-through');
  });
});