import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils';
import { AllRoutinesView } from '../../components/AllRoutinesView';
import type { RoutineRecord } from '../../db/schema';

const updateRoutineMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../repositories/routinesRepository', () => ({
  updateRoutine: (...args: unknown[]) => updateRoutineMock(...args),
}));

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

describe('AllRoutinesView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('segments routines into active and paused groups', () => {
    renderWithProviders(
      <MemoryRouter>
        <AllRoutinesView
          routines={[
            makeRoutine({ id: 'a-1', title: 'Morning', status: 'active' }),
            makeRoutine({ id: 'p-1', title: 'Evening', status: 'paused' }),
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Evening')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('calls inline toggle actions for pause and resume', async () => {
    updateRoutineMock.mockResolvedValue(undefined);

    renderWithProviders(
      <MemoryRouter>
        <AllRoutinesView
          routines={[
            makeRoutine({ id: 'a-1', title: 'Morning', status: 'active' }),
            makeRoutine({ id: 'p-1', title: 'Evening', status: 'paused' }),
          ]}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));

    expect(updateRoutineMock).toHaveBeenCalledWith('a-1', { status: 'paused' });
    expect(updateRoutineMock).toHaveBeenCalledWith('p-1', { status: 'active' });
  });

  it('offers a create routine action', async () => {
    renderWithProviders(
      <MemoryRouter>
        <AllRoutinesView routines={[]} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create routine' }));

    expect(navigateMock).toHaveBeenCalledWith('/routines/new');
  });
});
