import type { Meta, StoryObj } from '@storybook/react-vite';
import FilterBar from '../../../src/components/layout/FilterBar';

const meta = {
  title: 'Layout/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composite filter bar with filter buttons, sort control, and dropdown menu. Combines Card, Button, Badge, Sort, and Dropdown components.',
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPadding: Story = {
  render: () => (
    <div style={{ padding: '20px', background: '#e4e8ec' }}>
      <FilterBar />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'FilterBar shown with surrounding padding and background, as it appears in the app',
      },
    },
  },
};
