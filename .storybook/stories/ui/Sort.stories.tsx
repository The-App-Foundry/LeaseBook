import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import Sort from '../../../src/components/ui/Sort';

const meta = {
  title: 'UI/Sort',
  component: Sort,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A stateful toggle button for sorting controls. Alternates between ascending and descending sort orders with visual icon feedback.',
      },
    },
  },
} satisfies Meta<typeof Sort>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default state shows ascending sort icon (ArrowDownUp)',
      },
    },
  },
};

export const WithInteractionTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sortButton = canvas.getByRole('button');

    // Initial state should be ascending
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: ascending');

    // Click to toggle to descending
    await userEvent.click(sortButton);
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: descending');

    // Click again to toggle back to ascending
    await userEvent.click(sortButton);
    await expect(sortButton).toHaveAttribute('aria-label', 'Sort: ascending');
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the toggle interaction - click to switch between ascending and descending states.',
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px' }}>Sort:</span>
      <Sort />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of Sort component in context with a label, as used in FilterBar',
      },
    },
  },
};
