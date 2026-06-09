import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { waitFor, screen } from '@testing-library/react';

describe('RoutineWorkspace interactions', () => {
  it('persists yes/no completion entries', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Mark complete' }));

    await waitFor(async () => {
      const entries = await db.entries.where('habitId').equals('habit-water').toArray();
      expect(entries.length).toBe(1);
      expect(entries[0]?.boolValue).toBe(true);
    });
  });

  it('autosaves measurement value on blur', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = await screen.findByLabelText('Mood check');
    await userEvent.clear(input);
    await userEvent.type(input, 'Calm and focused');
    await userEvent.tab();

    await waitFor(async () => {
      const entries = await db.entries.where('habitId').equals('habit-mood').toArray();
      expect(entries.length).toBe(1);
      expect(entries[0]?.textValue).toBe('Calm and focused');
    });
  });
});
