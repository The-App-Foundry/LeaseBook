import type { Preview } from '@storybook/react-vite';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/App.css';

const preview: Preview = {
  decorators: [
    Story => (
      <Story />
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
