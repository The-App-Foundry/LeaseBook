import type { Meta, StoryObj } from '@storybook/react-vite';
import Card from '../../../src/components/ui/Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    $width: {
      control: 'text',
      description: 'Width of the card (CSS value)',
    },
    $height: {
      control: 'text',
      description: 'Height of the card (CSS value)',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a card',
  },
};

export const CustomWidth: Story = {
  args: {
    $width: '400px',
    children: 'Card with 400px width',
  },
};

export const CustomHeight: Story = {
  args: {
    $height: '100px',
    children: 'Card with 100px height',
  },
};

export const CustomSize: Story = {
  args: {
    $width: '600px',
    $height: '120px',
    children: 'Card with custom width and height',
  },
};

export const WithContent: Story = {
  args: {
    $width: '500px',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <h3 style={{ margin: 0 }}>Card Title</h3>
        <p style={{ margin: 0 }}>
          This card contains structured content with a title and description.
        </p>
      </div>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    $width: '600px',
    children: (
      <>
        <span>Left content</span>
        <span>Right content</span>
      </>
    ),
  },
};

export const MultipleSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card $width="300px">Small card (300px)</Card>
      <Card $width="500px">Medium card (500px)</Card>
      <Card $width="800px">Large card (800px)</Card>
      <Card $width="100%">Full width card</Card>
    </div>
  ),
};
