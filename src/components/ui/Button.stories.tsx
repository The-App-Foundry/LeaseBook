import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Plus } from 'lucide-react';
import Button from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    $variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'destructive'],
      description: 'The visual style variant of the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    $variant: 'default',
    children: 'Default Button',
  },
};

export const Outline: Story = {
  args: {
    $variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    $variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Destructive: Story = {
  args: {
    $variant: 'destructive',
    children: 'Delete',
  },
};

export const WithIcon: Story = {
  args: {
    $variant: 'default',
    children: (
      <>
        <Plus size={16} />
        New Property
      </>
    ),
  },
};

export const FilterButton: Story = {
  args: {
    className: 'filter',
    children: 'All Properties',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button $variant="default">Default</Button>
      <Button $variant="outline">Outline</Button>
      <Button $variant="ghost">Ghost</Button>
      <Button $variant="destructive">Destructive</Button>
      <Button $variant="default">
        <Plus size={16} />
        With Icon
      </Button>
      <Button className="filter">Filter Style</Button>
    </div>
  ),
};
