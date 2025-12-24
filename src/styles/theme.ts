import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: '#2563eb',
    background: '#f8fafc',
    text: '#0f172a',
    surface: '#ffffff',
    muted: '#6b7280',
    border: '#e6eef8',
    success: '#16a34a',
    danger: '#ef4444',
    focus: '#60a5fa',
  },
  fonts: {
    body: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    mono: "Menlo, Monaco, 'Courier New', monospace",
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
};
