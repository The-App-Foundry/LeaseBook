import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Home, Building, Factory } from 'lucide-react';
import Dropdown from './Dropdown';

const meta = {
  title: 'UI/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    buttonLabel: {
      control: 'text',
      description: 'Label text for the dropdown trigger button',
    },
    items: {
      description: 'Array of menu items with title, optional icon, and optional action',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A dropdown menu component with smart positioning that flips above/below based on viewport space.',
      },
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttonLabel: 'Options',
    items: [{ title: 'Option 1' }, { title: 'Option 2' }, { title: 'Option 3' }],
  },
};

export const WithIcons: Story = {
  args: {
    buttonLabel: 'Select Type',
    items: [
      { title: 'Residential', icon: <Home size={16} /> },
      { title: 'Commercial', icon: <Building size={16} /> },
      { title: 'Industrial', icon: <Factory size={16} /> },
    ],
  },
};

export const SortByDropdown: Story = {
  args: {
    buttonLabel: 'Sort by',
    items: [{ title: 'Expiration' }, { title: 'Address' }, { title: 'Type' }],
  },
  parameters: {
    docs: {
      description: {
        story: 'Example from FilterBar showing sort options',
      },
    },
  },
};

export const ManyItems: Story = {
  args: {
    buttonLabel: 'Select State',
    items: [
      { title: 'Alabama' },
      { title: 'Alaska' },
      { title: 'Arizona' },
      { title: 'Arkansas' },
      { title: 'California' },
      { title: 'Colorado' },
      { title: 'Connecticut' },
      { title: 'Delaware' },
      { title: 'Florida' },
      { title: 'Georgia' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with many items shows scrolling behavior',
      },
    },
  },
};

export const WithInteractionTest: Story = {
  args: {
    buttonLabel: 'Actions',
    items: [{ title: 'Edit' }, { title: 'Delete' }, { title: 'Archive' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Actions/i });

    // Initially closed
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Menu should be visible
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Should have 3 menu items
    const menuItems = canvas.getAllByRole('menuitem');
    await expect(menuItems).toHaveLength(3);
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates dropdown interaction - click to open/close, escape to close',
      },
    },
  },
};
