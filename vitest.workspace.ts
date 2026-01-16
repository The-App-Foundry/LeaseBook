import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import browserConfig from './vitest.browser.config';

export default mergeConfig(
  browserConfig,
  defineConfig({
    plugins: [storybookTest()],
    test: {
      name: 'storybook',
      setupFiles: ['.storybook/vitest.setup.ts'],
    },
  }),
);
