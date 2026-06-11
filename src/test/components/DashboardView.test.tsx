import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils';
import { DashboardView } from '../../components/DashboardView';
import type { RoutineRecord } from '../../db/schema';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function makeRoutine(overrides: Partial<RoutineRecord>): RoutineRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Routine',
    status: overrides.status ?? 'active',
    createdAt: overrides.createdAt ?? '2026-06-09T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-09T00:00:00.000Z',
    lastAccessedAt: overrides.lastAccessedAt ?? '2026-06-09T00:00:00.000Z',
    description: overrides.description,
  };
}

describe('DashboardView', () => {
  it('shows greeting and empty state when there are no active routines', () => {
    const pausedOnly = [makeRoutine({ id: 'paused', title: 'Paused', status: 'paused' })];

    renderWithProviders(
      <MemoryRouter>
        <DashboardView routines={pausedOnly} />
      </MemoryRouter>,
    );

    expect(document.body.textContent).toMatch(/Good morning|Good afternoon|Good evening/);
    expect(screen.getByRole('heading', { name: 'Create your first routine' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create your first routine' })).toBeInTheDocument();
  });

  it('navigates to the draft routine flow from the empty state action', () => {
    renderWithProviders(
      <MemoryRouter>
        <DashboardView routines={[]} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create your first routine' }));

    expect(navigateMock).toHaveBeenCalledWith('/routines/new');
  });

  it('shows recent active routines and a create button', () => {
    const routines: RoutineRecord[] = [
      makeRoutine({ id: 'r-1', title: 'Newest', status: 'active', lastAccessedAt: '2026-06-09T10:00:00.000Z' }),
      makeRoutine({ id: 'r-2', title: 'Second', status: 'active', lastAccessedAt: '2026-06-09T09:00:00.000Z' }),
      makeRoutine({ id: 'r-3', title: 'Third', status: 'active', lastAccessedAt: '2026-06-09T08:00:00.000Z' }),
      makeRoutine({ id: 'r-4', title: 'Too Old', status: 'active', lastAccessedAt: '2026-06-09T07:00:00.000Z' }),
      makeRoutine({ id: 'r-5', title: 'Paused', status: 'paused', lastAccessedAt: '2026-06-09T11:00:00.000Z' }),
    ];

    renderWithProviders(
      <MemoryRouter>
        <DashboardView routines={routines} />
      </MemoryRouter>,
    );

    expect(document.body.textContent).toContain('Recent routines');
    expect(document.body.textContent).toContain('Newest');
    expect(document.body.textContent).toContain('Second');
    expect(document.body.textContent).toContain('Third');
    expect(document.body.textContent).not.toContain('Too Old');
    expect(document.body.textContent).not.toContain('Paused');
    expect(screen.getByRole('button', { name: 'Create routine' })).toBeInTheDocument();
  });
});
