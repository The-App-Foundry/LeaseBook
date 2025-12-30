# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeaseBook is a cross-platform property management application built with Tauri v2, React 19, TypeScript, and styled-components. The application targets desktop (Linux, macOS, Windows), Android, and iOS platforms.

**Tech Stack:**

- **Frontend**: React 19 + TypeScript + Vite
- **UI Styling**: styled-components with a custom theme system
- **Backend**: Tauri v2 (Rust)
- **Icons**: lucide-react
- **Package Manager**: pnpm 10.26.1

## Development Commands

### Frontend Development

```bash
# Start Vite dev server only
pnpm dev

# Start Tauri desktop app in dev mode (filters Gdk warnings)
pnpm tauri:dev

# Build frontend for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Run ESLint
pnpm lint

# Auto-fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format
```

### Building

```bash
# Build Tauri desktop app for production
pnpm tauri:build
```

## Architecture

### Frontend Structure

The React application uses a component-based architecture with centralized theming:

- **Entry Point**: `src/main.tsx` wraps the app with `ThemeProvider` and `GlobalStyle`
- **Theme System**: `src/styles/theme.ts` exports the theme object, typed in `src/styles/styled.d.ts`
- **Global Styles**: `src/styles/global.ts` contains CSS resets and base typography
- **Component Organization**:
  - `src/components/ui/`: Reusable UI primitives (Button, Card, Badge, SearchBar, Sort)
  - `src/components/layout/`: Layout components (Header, FilterBar)
  - Each directory has an `index.ts` barrel file for clean imports

### Styled-Components Patterns

All components use styled-components with the following conventions:

1. **Transient Props**: Use `$` prefix for props that shouldn't be passed to the DOM (e.g., `$variant`, `$width`)
2. **Theme Access**: Components access theme via `${({ theme }) => theme.colors.primary}`
3. **CSS Variables**: App uses CSS custom properties for spacing (`--spacing: 0.25rem`) and layout (`--app-header-height`)
4. **Lucide Icons**: Import and wrap icons with styled-components for styling

Example pattern:

```tsx
const StyledIcon = styled(IconFromLucide)`
  height: 16px;
  width: 16px;
`;
```

### Layout System

- **Fixed Header**: The Header component is fixed at the top with `position: fixed` and `z-index: 20`
- **Content Area**: Main content uses `padding-top: var(--app-header-height)` to offset the fixed header
- **Responsive**: Components use `100vw`, flexbox, and responsive units

### Tauri Backend

- **Entry Point**: `src-tauri/src/lib.rs` contains the `run()` function
- **Commands**: Custom Tauri commands are defined in `src-tauri/src/commands.rs` (currently just a sample `greet` command)
- **Plugins**: Uses `tauri-plugin-opener` and `tauri-plugin-fs`
- **Configuration**: `src-tauri/tauri.conf.json` defines app metadata, build commands, window settings, and security policies

The Tauri configuration specifies:

- Dev server runs on port 1420
- Frontend dist is `../dist` relative to `src-tauri/`
- CSP policy: `default-src asset: https://asset.localhost data: https`
- Asset protocol enabled with scope: `$HOME/.local/share/com.openworld.leasebook/**`

### Build Process

1. **Development**: Vite dev server runs on port 1420, Tauri watches Rust changes
2. **Production**: `pnpm build` runs TypeScript compilation + Vite build, then Tauri bundles the app
3. **Vite Config**: Uses `@vitejs/plugin-react`, configured to ignore `src-tauri/` in watch mode

## Theme Configuration

The theme object (`src/styles/theme.ts`) provides:

- **Colors**: primary, background, text, surface, muted, border, success, danger, focus
- **Typography**: System font stacks for body and mono
- **Radii**: sm (6px), md (8px), lg (12px)

TypeScript autocomplete is enabled via `src/styles/styled.d.ts` which extends the `DefaultTheme` interface.

## Code Style

- **ESLint**: Uses flat config (eslint.config.cjs) with TypeScript, React, and a11y plugins
- **Prettier**: Configured for 100-char line width, single quotes, trailing commas, LF line endings
- **TypeScript**: Strict mode enabled with unused locals/parameters checks

## Important Notes

- This is currently in early development (branch: `2-ui---basic-components`, v0.1.0)
- Main branch is `base` (use this for PRs)
- When adding new Tauri commands, define them in `src-tauri/src/commands.rs` and register in `lib.rs`
- All UI components should use the theme system rather than hardcoded colors
- Use transient props (`$prop`) in styled-components to avoid React DOM warnings
