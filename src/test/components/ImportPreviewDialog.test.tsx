import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { ImportPreviewDialog } from '../../components/ImportPreviewDialog';

describe('ImportPreviewDialog', () => {
  it('confirms import when user accepts', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ImportPreviewDialog
        isOpen
        title="Morning"
        description="Start calm"
        categoryCount={2}
        habitCount={3}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Import routine' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('rejects import when user cancels', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <ImportPreviewDialog
        isOpen
        title="Morning"
        categoryCount={1}
        habitCount={1}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
