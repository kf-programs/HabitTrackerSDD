import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../utils';
import { DailyGrid } from '../../components/DailyGrid';

describe('DailyGrid deletion window visibility', () => {
  it('renders sparse historical columns without crashing when some days have no tiles', () => {
    renderWithProviders(
      <DailyGrid
        dailyTiles={[
          { periodKey: '2026-06-08', completed: true, pastelToken: 'mist-2' },
          { periodKey: '2026-06-09', completed: false, pastelToken: 'mist-2' },
        ]}
        weeklyTiles={[]}
        startLabel="Jun 8, 2026"
        endLabel="Jun 9, 2026"
        selectedDayKey="2026-06-09"
      />,
    );

    expect(document.body.textContent).toContain('Days');
    expect(document.querySelector('[role="list"]')).toBeTruthy();
  });
});
