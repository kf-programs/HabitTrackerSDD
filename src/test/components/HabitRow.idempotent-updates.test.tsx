import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { HabitRow } from '../../components/HabitRow';

describe('HabitRow idempotent updates', () => {
  it('applies repeated counter updates and persists last value intent', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClearEntry = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-counter"
        title="Counter Habit"
        trackingType="counter"
        timeframe="daily"
        initialInteger={0}
        onSave={onSave}
        onClearEntry={onClearEntry}
      />,
    );

    await userEvent.clear(screen.getByLabelText('Counter Habit counter value'));
    await userEvent.type(screen.getByLabelText('Counter Habit counter value'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Set' }));

    await userEvent.click(screen.getByRole('button', { name: 'Unset' }));

    await userEvent.clear(screen.getByLabelText('Counter Habit counter value'));
    await userEvent.type(screen.getByLabelText('Counter Habit counter value'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Set' }));

    expect(onSave).toHaveBeenNthCalledWith(1, 'habit-counter', 1);
    expect(onSave).toHaveBeenNthCalledWith(2, 'habit-counter', 2);
    expect(onClearEntry).toHaveBeenCalledWith('habit-counter');
    expect(screen.getByDisplayValue('2')).toBeTruthy();
  });
});
