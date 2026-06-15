import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../utils';
import { DailyGrid } from '../../components/DailyGrid';

describe('DailyGrid visual continuity', () => {
  it('applies consistent completion styling and selected day highlighting', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={[
          { periodKey: '2026-06-08', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-09', completed: true, pastelToken: 'mist-2' },
        ]}
        weeklyTiles={[]}
        startLabel="Jun 8, 2026"
        endLabel="Jun 9, 2026"
        selectedDayKey="2026-06-09"
      />,
    );

    const selected = document.querySelector('[title="2026-06-09"]');
    expect(selected?.className).toContain('ring-2');
  });

  it('highlights only the weekly pill for the selected day week', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={[
          { periodKey: '2026-06-07', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-14', completed: true, pastelToken: 'mist-2' },
        ]}
        weeklyTiles={[
          { periodKey: '2026-05-31-SUN', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-07-SUN', completed: true, pastelToken: 'mist-2' },
        ]}
        startLabel="Jun 1, 2026"
        endLabel="Jun 14, 2026"
        selectedDayKey="2026-06-09"
      />,
    );

    const selectedWeek = document.querySelector('[title="2026-06-07-SUN"]');
    const otherWeek = document.querySelector('[title="2026-05-31-SUN"]');

    expect(selectedWeek?.className).toContain('ring-2');
    expect(otherWeek?.className).not.toContain('ring-2');
  });
});
