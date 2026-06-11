import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationDialog from '../../../components/modals/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmationDialog
        isOpen={false}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should render with correct title, message, and buttons when isOpen is true', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when the cancel button is clicked', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should have appropriate accessibility attributes', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('supports custom confirm and cancel labels', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Unsaved changes"
        message="Save before leaving?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="Save"
        cancelLabel="Leave"
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
  });
});
