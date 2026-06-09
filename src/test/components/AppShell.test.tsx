import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AppShell } from '../../app/AppShell';

vi.mock('../../repositories/routinesRepository', () => ({
  listRoutines: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../db/seed', () => ({
  seedDatabase: vi.fn().mockResolvedValue(undefined),
}));

describe('AppShell offline behavior', () => {
  it('shows offline startup banner when navigator is offline', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<AppShell />);

    expect(screen.getByText(/Offline mode:/i)).toBeInTheDocument();
  });

  it('hides offline banner when online event is dispatched', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<AppShell />);
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/Offline mode:/i)).not.toBeInTheDocument();
    });
  });
});
