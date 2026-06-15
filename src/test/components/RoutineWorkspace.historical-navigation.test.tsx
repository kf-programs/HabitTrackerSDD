import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { getDayKey, shiftDayKey } from '../../utils/dateBoundaries';

describe('RoutineWorkspace historical navigation', () => {
  it('writes completion against the selected historical day without mutating today', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Previous day' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Mark complete' }));

    const yesterday = shiftDayKey(getDayKey(), -1);
    const today = getDayKey();

    await waitFor(async () => {
      const historical = await db.entries.where('[habitId+periodKey]').equals(['habit-water', yesterday]).first();
      expect(historical?.boolValue).toBe(true);
    });

    const todayEntry = await db.entries.where('[habitId+periodKey]').equals(['habit-water', today]).first();
    expect(todayEntry).toBeUndefined();
  });
});
