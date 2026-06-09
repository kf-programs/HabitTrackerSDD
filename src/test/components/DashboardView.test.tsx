import React from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils';
import { DashboardView } from '../../components/DashboardView';
import type { RoutineRecord } from '../../db/schema';

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
    expect(document.body.textContent).toContain('No active routines yet');
    expect(document.body.textContent).toContain('Go to All Routines');
  });

  it('shows recent active routines only and caps list to three', () => {
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
  });
});
