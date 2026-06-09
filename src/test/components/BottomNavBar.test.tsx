import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../utils';
import { BottomNavBar } from '../../app/BottomNavBar';

describe('BottomNavBar', () => {
  it('switches routes between Home and All Routines', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <BottomNavBar />
        <Routes>
          <Route path="/" element={<div>Home View</div>} />
          <Route path="/routines" element={<div>All Routines View</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home View')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'All Routines' }));
    expect(screen.getByText('All Routines View')).toBeInTheDocument();
  });
});
