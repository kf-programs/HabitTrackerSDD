import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import { screen } from '@testing-library/react';
import { HabitRow } from '../../components/HabitRow';

describe('HabitRow yes/no toggles', () => {
  it('toggles daily habits between Mark complete and Mark incomplete', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-daily"
        title="Drink water"
        trackingType="yesno"
        timeframe="daily"
        initialBoolean={false}
        onSave={onSave}
      />,
    );

    const button = screen.getByRole('button', { name: 'Mark complete' });
    await user.click(button);

    expect(onSave).toHaveBeenCalledWith('habit-daily', true);
    expect(screen.getByRole('button', { name: 'Mark incomplete' })).toBeTruthy();
  });

  it('toggles weekly habits between Mark done this week and Mark incomplete', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <HabitRow
        habitId="habit-weekly"
        title="Reflect"
        trackingType="yesno"
        timeframe="weekly"
        initialBoolean={false}
        onSave={onSave}
      />,
    );

    const button = screen.getByRole('button', { name: 'Mark done this week' });
    await user.click(button);

    expect(onSave).toHaveBeenCalledWith('habit-weekly', true);
    expect(screen.getByRole('button', { name: 'Mark incomplete' })).toBeTruthy();
  });
});