import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { waitFor, screen } from '@testing-library/react';
import * as categoriesRepository from '../../repositories/categoriesRepository';

const exportRoutineStructureMock = vi.fn();

vi.mock('../../services/sharingService', async () => {
  const actual = await vi.importActual<typeof import('../../services/sharingService')>('../../services/sharingService');
  return {
    ...actual,
    exportRoutineStructure: (...args: unknown[]) => exportRoutineStructureMock(...args),
  };
});

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

  it('copies a share link for the current routine', async () => {
    await seedDatabase();
    exportRoutineStructureMock.mockResolvedValue('encoded-payload');
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Share routine' }));

    expect(exportRoutineStructureMock).toHaveBeenCalledWith('routine-morning');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/import?d=encoded-payload`);
  });

  it('opens a confirmation dialog before deleting a routine', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /delete routine/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Routine')).toBeInTheDocument();

    // Routine should still exist
    expect(await db.routines.get('routine-morning')).toBeTruthy();
  });

  it('deletes the routine when confirmation is given', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
          <Route path="/routines" element={<div>Routines Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /delete routine/i }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirm' }));

    await waitFor(async () => {
      expect(await db.routines.get('routine-morning')).toBeUndefined();
    });
    expect(screen.getByText('Routines Page')).toBeInTheDocument();
  });

  it('does not delete the routine when confirmation is cancelled', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /delete routine/i }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(await db.routines.get('routine-morning')).toBeTruthy();
  });

  it('shows the title input when the edit button is clicked', async () => {
    await seedDatabase();

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /edit routine details/i }));

    expect(await screen.findByLabelText('Routine title')).toBeInTheDocument();
  });

  it('creates a new category when the "New Category" button is clicked', async () => {
    await seedDatabase();
    const createCategorySpy = vi.spyOn(categoriesRepository, 'createCategory');

    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/routine-morning']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: /new category/i }));

    expect(createCategorySpy).toHaveBeenCalledWith('routine-morning', 'Category 3', 2);
  });

  it('shows an unsaved-changes dialog when canceling a new draft', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/new']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(await screen.findByLabelText('Routine title'), 'Evening Reset');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Save before leaving?')).toBeInTheDocument();
  });

  it('saves a new draft when confirming save-before-leave', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/new']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
          <Route path="/routines" element={<div>Routines Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(await screen.findByLabelText('Routine title'), 'Evening Reset');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(async () => {
      const created = (await db.routines.toArray()).filter((routine) => routine.title === 'Evening Reset');
      expect(created.length).toBeGreaterThan(0);
    });
  });

  it('discards a new draft when leaving without saving', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/new']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
          <Route path="/routines" element={<div>Routines Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(await screen.findByLabelText('Routine title'), 'Discard Me');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Leave without saving' }));

    await waitFor(async () => {
      const discarded = (await db.routines.toArray()).filter((routine) => routine.title === 'Discard Me');
      expect(discarded.length).toBe(0);
    });
  });

  it('opens a created routine in view mode with persisted title and description', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/routines/new']}>
        <Routes>
          <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await userEvent.type(await screen.findByLabelText('Routine title'), 'Morning Flow');
    await userEvent.type(screen.getByLabelText('Routine description'), 'Gentle start to the day');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByRole('heading', { name: 'Morning Flow' });

    expect(screen.queryByLabelText('Routine title')).toBeNull();
    expect(screen.getByText('Gentle start to the day')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit routine details/i })).toBeInTheDocument();
  });
});
