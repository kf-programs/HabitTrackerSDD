import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { waitFor, screen } from '@testing-library/react';
import { createRoutine } from '../../repositories/routinesRepository';
import { createCategory } from '../../repositories/categoriesRepository';
import { createHabit, listHabitsForRoutineOnDate } from '../../repositories/habitsRepository';
import { upsertEntry } from '../../repositories/entriesRepository';
import * as habitsRepository from '../../repositories/habitsRepository';

describe('RoutineWorkspace deletion flows', () => {
  it('opens a confirmation dialog when deleting a habit', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Habit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('keeps habit unchanged when habit deletion is cancelled', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect((await db.habits.get('habit-water'))?.status).toBe('active');
  });

  it('removes only the targeted habit after confirmation', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(async () => {
      expect((await db.habits.get('habit-water'))?.status).toBe('deleted');
    });

    expect((await db.habits.get('habit-stretch'))?.status).toBe('active');
  });

  it('opens a confirmation dialog when deleting a category', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete category Gentle Start' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Category')).toBeInTheDocument();
  });

  it('keeps category and habits unchanged when category deletion is cancelled', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete category Gentle Start' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(await db.categories.get('category-hydration')).toBeTruthy();
    expect((await db.habits.get('habit-water'))?.status).toBe('active');
  });

  it('deletes selected category only in current routine scope', async () => {
    await seedDatabase();
    const otherRoutine = await createRoutine('Secondary');
    const otherCategory = await createCategory(otherRoutine.id, 'Gentle Start', 0);
    const otherHabit = await createHabit({
      routineId: otherRoutine.id,
      categoryId: otherCategory.id,
      title: 'Other routine habit',
      timeframe: 'daily',
      trackingType: 'yesno',
      measurementUnit: undefined,
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete category Gentle Start' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(async () => {
      expect(await db.categories.get('category-hydration')).toBeUndefined();
    });

    expect(await db.categories.get(otherCategory.id)).toBeTruthy();
    expect((await db.habits.get(otherHabit.id))?.status).toBe('active');
  });

  it('does not mutate data before confirmation click', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));

    expect((await db.habits.get('habit-water'))?.status).toBe('active');
    expect(await db.categories.get('category-hydration')).toBeTruthy();
  });

  it('keeps item visible and shows error message when deletion persistence fails', async () => {
    await seedDatabase();
    const deleteHabitSpy = vi.spyOn(habitsRepository, 'deleteHabit').mockRejectedValueOnce(new Error('Delete failed'));

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Delete failed')).toBeInTheDocument();
    expect(screen.getByText('Drink water')).toBeInTheDocument();
    expect((await db.habits.get('habit-water'))?.status).toBe('active');

    deleteHabitSpy.mockRestore();
  });

  it('preserves historical entries after confirmed habit deletion', async () => {
    await seedDatabase();
    await upsertEntry({
      habitId: 'habit-water',
      timeframe: 'daily',
      periodKey: '2026-06-10',
      valueType: 'boolean',
      boolValue: true,
      source: 'user',
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Delete habit Drink water' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(async () => {
      expect((await db.habits.get('habit-water'))?.status).toBe('deleted');
    });

    const entries = await db.entries.where('habitId').equals('habit-water').toArray();
    expect(entries.some((entry) => entry.periodKey === '2026-06-10')).toBe(true);

    const historicalHabits = await listHabitsForRoutineOnDate('routine-morning', '2026-06-10');
    expect(historicalHabits.some((habit) => habit.id === 'habit-water')).toBe(true);
  });
});
