import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'select',
      options: ['emerald', 'gray', 'trans'],
      description: 'Color variant class name',
    },
    children: {
      control: 'text',
      description: 'Badge content (usually a single letter or number)',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Emerald: Story = {
  args: {
    className: 'emerald',
    children: 'Q',
  },
};

export const Gray: Story = {
  args: {
    className: 'gray',
    children: 'P',
  },
};

export const Transparent: Story = {
  args: {
    className: 'trans',
    children: 'T',
  },
};

export const WithNumber: Story = {
  args: {
    className: 'emerald',
    children: '5',
  },
};

export const QualifiedBadge: Story = {
  args: {
    className: 'emerald',
    children: 'Q',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used in FilterBar for Qualified status',
      },
    },
  },
};

export const ProspectBadge: Story = {
  args: {
    className: 'gray',
    children: 'P',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used in FilterBar for Prospect status',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge className="emerald">Q</Badge>
      <Badge className="gray">P</Badge>
      <Badge className="trans">T</Badge>
      <Badge className="emerald">1</Badge>
      <Badge className="gray">2</Badge>
    </div>
  ),
};
