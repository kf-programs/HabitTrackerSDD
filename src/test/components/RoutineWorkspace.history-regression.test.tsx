import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { getDayKey, shiftDayKey } from '../../utils/dateBoundaries';

describe('RoutineWorkspace historical regression', () => {
  it('maintains past-day completion when navigating back to today', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'Today' }));

    const yesterday = shiftDayKey(getDayKey(), -1);
    const historical = await db.entries.where('[habitId+periodKey]').equals(['habit-water', yesterday]).first();
    expect(historical?.boolValue).toBe(true);
  }, 15000);
});
