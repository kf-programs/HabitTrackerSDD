import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { BottomNavBar } from '../../app/BottomNavBar';
import { seedDatabase } from '../../db/seed';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';

const renderWithRouter = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/routines" element={<div>All Routines Page</div>} />
        <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
      </Routes>
      <BottomNavBar />
    </MemoryRouter>
  );
};

describe('BottomNavBar', () => {
  it('highlights the Home link on the home page', () => {
    renderWithRouter(['/']);
    const homeLink = screen.getByRole('link', { name: 'Home view' });
    expect(homeLink).toHaveClass('bg-ink text-paper');
  });

  it('highlights the All Routines link on the routines page', () => {
    renderWithRouter(['/routines']);
    const routinesLink = screen.getByRole('link', { name: 'All routines view' });
    expect(routinesLink).toHaveClass('bg-ink text-paper');
  });

  it('shows and highlights the routine name when on a routine workspace page', async () => {
    await seedDatabase();
    renderWithRouter(['/routines/routine-morning']);

    const routineLink = await screen.findByRole('link', { name: 'Morning Ritual' });
    expect(routineLink).toBeInTheDocument();
    expect(routineLink).toHaveClass('bg-ink text-paper');

    const homeLink = screen.getByRole('link', { name: 'Home view' });
    expect(homeLink).not.toHaveClass('bg-ink text-paper');
    expect(screen.queryByRole('link', { name: 'All routines view' })).toBeNull();
  });
});
