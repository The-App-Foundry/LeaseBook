import type { Meta, StoryObj } from '@storybook/react-vite';
import GridContainer from './GridContainer';
import Card from '../ui/Card';

const meta = {
  title: 'Layout/GridContainer',
  component: GridContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive grid layout container using CSS Grid with auto-fill and minmax(220px, 1fr). Uses --spacing CSS variable for gap.',
      },
    },
  },
} satisfies Meta<typeof GridContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    children: null,
  },
};

export const WithCards: Story = {
  args: {
    children: (
      <>
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
        <Card>Item 4</Card>
      </>
    ),
  },
};

export const ManyItems: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 12 }, (_, i) => (
          <Card key={i} $height="100px">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              Item {i + 1}
            </div>
          </Card>
        ))}
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the responsive grid behavior with 12 items. Grid automatically adjusts columns based on container width.',
      },
    },
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ margin: 0 }}>Card {i + 1}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>Sample content for card {i + 1}</p>
            </div>
          </Card>
        ))}
      </>
    ),
  },
};
