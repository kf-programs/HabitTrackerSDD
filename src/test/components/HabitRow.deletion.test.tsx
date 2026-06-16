import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { HabitRow } from '../../components/HabitRow';

describe('HabitRow deletion controls', () => {
  it('renders a delete trash control to the right of the Edit button', async () => {
    const onDeleteHabit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-1"
        title="Drink water"
        trackingType="yesno"
        timeframe="daily"
        initialBoolean={false}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRenameHabit={vi.fn().mockResolvedValue(undefined)}
        onDeleteHabit={onDeleteHabit}
      />,
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete habit Drink water' });
    expect(editButton.compareDocumentPosition(deleteButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.click(deleteButton);

    expect(onDeleteHabit).toHaveBeenCalledWith('habit-1');
  });

  it('uses a wrapping title/action row so controls can move below long titles on mobile', () => {
    renderWithProviders(
      <HabitRow
        habitId="habit-1"
        title="A very long habit title that should not push controls off-screen on mobile"
        trackingType="yesno"
        timeframe="daily"
        initialBoolean={false}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRenameHabit={vi.fn().mockResolvedValue(undefined)}
        onDeleteHabit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const titleActionRow = editButton.parentElement;

    expect(titleActionRow).not.toBeNull();
    expect(titleActionRow?.className).toContain('flex-wrap');
  });
});
