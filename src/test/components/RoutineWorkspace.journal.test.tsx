import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { RoutineWorkspace, JOURNAL_AUTOSAVE_DEBOUNCE_MS } from '../../components/RoutineWorkspace';
import { seedDatabase } from '../../db/seed';
import { db } from '../../db/client';
import { getDayKey, shiftDayKey } from '../../utils/dateBoundaries';

async function seedSecondRoutine() {
  const now = new Date().toISOString();
  await db.routines.add({
    id: 'routine-evening',
    title: 'Evening Routine',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
  });

  await db.categories.add({
    id: 'category-evening',
    routineId: 'routine-evening',
    name: 'Wind down',
    orderIndex: 0,
    isExpandedDefault: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.habits.add({
    id: 'habit-evening',
    routineId: 'routine-evening',
    categoryId: 'category-evening',
    title: 'Reflect',
    timeframe: 'daily',
    trackingType: 'yesno',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
}

function renderWorkspace(route = '/routines/routine-morning') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/routines/:routineId" element={<RoutineWorkspace />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoutineWorkspace journal behavior', () => {
  it('renders journal textarea between timeline and first category', async () => {
    await seedDatabase();

    renderWorkspace();

    const timelinePicker = await screen.findByLabelText('Selected day');
    const journal = await screen.findByLabelText('Daily journal entry');
    const firstCategory = await screen.findByText('Gentle Start');

    expect(timelinePicker.compareDocumentPosition(journal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(journal.compareDocumentPosition(firstCategory) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }, 15000);

  it('auto-saves on debounce and on blur', async () => {
    const user = userEvent.setup();

    await seedDatabase();
    renderWorkspace();

    const journal = await screen.findByLabelText('Daily journal entry');
    await user.type(journal, 'Debounced note');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, JOURNAL_AUTOSAVE_DEBOUNCE_MS + 100));
    });

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('Debounced note');
    });

    await user.type(journal, ' updated');
    fireEvent.blur(journal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('Debounced note updated');
    });

  }, 20000);

  it('caps journal input at 2000 characters', async () => {
    await seedDatabase();
    renderWorkspace();

    const journal = await screen.findByLabelText('Daily journal entry');
    fireEvent.change(journal, { target: { value: 'x'.repeat(2500) } });

    expect((journal as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(2000);
  }, 15000);

  it('persists empty state after clearing and blurring', async () => {
    await seedDatabase();
    renderWorkspace();

    const user = userEvent.setup();
    const journal = await screen.findByLabelText('Daily journal entry');

    await user.type(journal, 'Temporary note');
    fireEvent.blur(journal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('Temporary note');
    });

    fireEvent.change(journal, { target: { value: '' } });
    fireEvent.blur(journal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('');
    });
  }, 15000);

  it('keeps same-date journal value after remount', async () => {
    await seedDatabase();

    const firstRender = renderWorkspace();
    const user = userEvent.setup();
    const journal = await screen.findByLabelText('Daily journal entry');
    await user.type(journal, 'Reload check');
    fireEvent.blur(journal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('Reload check');
    });

    firstRender.unmount();
    renderWorkspace();

    const remountedJournal = await screen.findByLabelText('Daily journal entry');
    expect((remountedJournal as HTMLTextAreaElement).value).toBe('Reload check');
  }, 15000);

  it('loads journal values for selected dates and shows empty state when missing', async () => {
    await seedDatabase();
    const today = getDayKey();
    const yesterday = shiftDayKey(today, -1);

    await db.routineJournalEntries.bulkAdd([
      {
        id: 'journal-today',
        routineId: 'routine-morning',
        dayKey: today,
        text: 'Today note',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'journal-yesterday',
        routineId: 'routine-morning',
        dayKey: yesterday,
        text: 'Yesterday note',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    renderWorkspace();

    const datePicker = await screen.findByLabelText('Selected day');
    const journal = await screen.findByLabelText('Daily journal entry');
    expect((journal as HTMLTextAreaElement).value).toBe('Today note');

    fireEvent.change(datePicker, { target: { value: yesterday } });
    await waitFor(() => {
      expect((journal as HTMLTextAreaElement).value).toBe('Yesterday note');
    });

    const twoDaysAgo = shiftDayKey(today, -2);
    fireEvent.change(datePicker, { target: { value: twoDaysAgo } });
    await waitFor(() => {
      expect((journal as HTMLTextAreaElement).value).toBe('');
    });
  }, 15000);

  it('flushes unsaved draft before switching dates', async () => {
    await seedDatabase();
    const today = getDayKey();
    const yesterday = shiftDayKey(today, -1);

    renderWorkspace();

    const user = userEvent.setup();
    const journal = await screen.findByLabelText('Daily journal entry');
    const datePicker = await screen.findByLabelText('Selected day');

    await user.type(journal, 'Unsaved before date switch');
    fireEvent.change(datePicker, { target: { value: yesterday } });

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', today]).first();
      expect(saved?.text).toBe('Unsaved before date switch');
    });
  }, 15000);

  it('uses selected-date local day key for journal writes', async () => {
    await seedDatabase();
    const yesterday = shiftDayKey(getDayKey(), -1);

    renderWorkspace();

    const user = userEvent.setup();
    const datePicker = await screen.findByLabelText('Selected day');
    fireEvent.change(datePicker, { target: { value: yesterday } });

    const journal = await screen.findByLabelText('Daily journal entry');
    await user.type(journal, 'Historical write');
    fireEvent.blur(journal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', yesterday]).first();
      expect(saved?.text).toBe('Historical write');
    });
  }, 15000);

  it('keeps journal isolated when switching routines on the same date', async () => {
    await seedDatabase();
    await seedSecondRoutine();

    const user = userEvent.setup();
    const morningView = renderWorkspace('/routines/routine-morning');

    const morningJournal = await screen.findByLabelText('Daily journal entry');
    await user.type(morningJournal, 'Morning note');
    fireEvent.blur(morningJournal);

    await waitFor(async () => {
      const saved = await db.routineJournalEntries.where('[routineId+dayKey]').equals(['routine-morning', getDayKey()]).first();
      expect(saved?.text).toBe('Morning note');
    });

    morningView.unmount();
    renderWorkspace('/routines/routine-evening');

    const eveningJournal = await screen.findByLabelText('Daily journal entry');
    expect((eveningJournal as HTMLTextAreaElement).value).toBe('');
  }, 15000);
});
