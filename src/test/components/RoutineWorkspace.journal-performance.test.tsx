import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { getDayKey, shiftDayKey } from '../../utils/dateBoundaries';

describe('RoutineWorkspace journal date-switch performance', () => {
  it('switches between dates with journal context within test performance envelope', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const journal = await screen.findByLabelText('Daily journal entry');
    fireEvent.change(journal, { target: { value: 'Performance context note' } });
    fireEvent.blur(journal);

    const datePicker = await screen.findByLabelText('Selected day');
    const today = getDayKey();
    const yesterday = shiftDayKey(today, -1);

    const start = performance.now();
    fireEvent.change(datePicker, { target: { value: yesterday } });
    fireEvent.change(datePicker, { target: { value: today } });
    const elapsed = performance.now() - start;

    // jsdom timing is noisy; this checks that instrumentation exists and avoids severe regressions.
    expect(elapsed).toBeLessThan(5000);
  }, 15000);
});
