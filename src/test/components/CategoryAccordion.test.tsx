import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import { CategoryAccordion } from '../../components/CategoryAccordion';

describe('CategoryAccordion', () => {
  it('opens first category by default and keeps others collapsed until toggled', () => {
    renderWithProviders(
      <div>
        <CategoryAccordion categoryId="category-1" title="First" defaultOpen>
          <div>First content</div>
        </CategoryAccordion>
        <CategoryAccordion categoryId="category-2" title="Second" defaultOpen={false}>
          <div>Second content</div>
        </CategoryAccordion>
      </div>,
    );

    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.queryByText('Second content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Second/i }));
    expect(screen.getByText('Second content')).toBeInTheDocument();
  });
});
