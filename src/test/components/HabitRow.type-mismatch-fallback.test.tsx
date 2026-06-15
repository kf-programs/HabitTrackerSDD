import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../utils';
import { HabitRow } from '../../components/HabitRow';

describe('HabitRow type mismatch fallback', () => {
  it('renders checkbox-style fallback for incompatible legacy counter values', () => {
    renderWithProviders(
      <HabitRow
        habitId="habit-counter"
        title="Pushups"
        trackingType="counter"
        timeframe="daily"
        initialBoolean
        fallbackApplied
        onSave={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(document.body.textContent).toContain('Done (legacy value)');
    expect(document.body.textContent).toContain('Historical fallback applied');
  });
});
