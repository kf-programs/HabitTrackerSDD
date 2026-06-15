import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { HabitRow } from '../../components/HabitRow';

describe('HabitRow idempotent updates', () => {
  it('applies repeated counter updates and persists last value intent', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-counter"
        title="Counter Habit"
        trackingType="counter"
        timeframe="daily"
        initialInteger={0}
        onSave={onSave}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '+' }));
    await userEvent.click(screen.getByRole('button', { name: '+' }));

    expect(onSave).toHaveBeenNthCalledWith(1, 'habit-counter', 1);
    expect(onSave).toHaveBeenNthCalledWith(2, 'habit-counter', 2);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
