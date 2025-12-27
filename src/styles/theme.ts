import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: '#4a3ee7ff',
    primaryForeground: '#ffffff',
    background: '#ffffff',
    text: '#030213', // Matches --foreground
    surface: '#ffffff', // Matches --card
    muted: '#ececf0', // Matches --muted
    border: 'rgba(0, 0, 0, 0.1)', // Matches --border
    success: '#16a34a',
    danger: '#d4183d', // Matches --destructive
    focus: '#030213',
    hover: '#7a9bf5ff'
  },
  fonts: {
    body: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  radii: {
    sm: '0.375rem', // ≈ 6px
    md: '0.5rem', // 8px (Standard Button Radius)
    lg: '0.75rem', // 12px (Card Radius)
  },
};
