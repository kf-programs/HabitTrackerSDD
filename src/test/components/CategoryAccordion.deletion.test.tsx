import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { CategoryAccordion } from '../../components/CategoryAccordion';

describe('CategoryAccordion deletion controls', () => {
  it('renders a delete trash control to the right of the Edit button', async () => {
    const onDeleteCategory = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CategoryAccordion
        categoryId="category-1"
        title="Movement"
        defaultOpen
        onRenameCategory={vi.fn().mockResolvedValue(undefined)}
        onDeleteCategory={onDeleteCategory}
      >
        <div>Category content</div>
      </CategoryAccordion>,
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete category Movement' });

    expect(editButton.compareDocumentPosition(deleteButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.click(deleteButton);
    expect(onDeleteCategory).toHaveBeenCalledWith('category-1');
  });
});
