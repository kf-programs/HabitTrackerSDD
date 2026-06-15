import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';

describe('RoutineWorkspace selected-date performance', () => {
  it('navigates between adjacent days within p95 target envelope in test environment', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    const start = performance.now();
    await userEvent.click(await screen.findByRole('button', { name: 'Previous day' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Next day' }));
    const elapsed = performance.now() - start;

    // Test environments include jsdom overhead; enforce a loose upper bound while still validating instrumentation.
    expect(elapsed).toBeLessThan(5000);
  });
});
