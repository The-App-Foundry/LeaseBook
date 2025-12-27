# Copilot Instructions for LeaseBook

## Quick Context

LeaseBook is a **cross-platform desktop property management app** (Tauri v2 + React 19 + TypeScript). Early-stage (v0.1.0, branch: `2-ui---basic-components`). Build and test commands differ from typical React apps due to Tauri desktop integration.

## Critical Build & Test Commands

**Frontend only (no Tauri window):**

- `pnpm dev` - Vite dev server on port 1420
- `pnpm build` - TypeScript + Vite build (outputs to `dist/`)
- `pnpm lint` / `pnpm lint:fix` - ESLint check/fix
- `pnpm format` - Prettier formatting

**Full desktop app (with Tauri):**

- `pnpm tauri:dev` - Desktop app with hot-reload (filters Gdk warnings on Linux)
- `pnpm tauri:build` - Bundled desktop app for distribution

## Architecture Essentials

### Frontend: styled-components + Theme System

The app uses **styled-components exclusively** with a centralized theme, not CSS files.

**Critical patterns:**

1. **Transient props** with `$` prefix (e.g., `$variant`, `$width`) to prevent React DOM warnings
2. **Theme access** via `${({ theme }) => theme.colors.primary}` from [src/styles/theme.ts](src/styles/theme.ts)
3. **CSS Variables** for layout: `--app-header-height`, `--spacing: 0.25rem`
4. **Lucide icons** wrapped with styled-components (see [src/components/ui/Button.tsx](src/components/ui/Button.tsx#L1-L30))

**Component example:**

```tsx
const StyledIcon = styled(IconFromLucide)`
  height: 16px;
  width: 16px;
  color: ${({ theme }) => theme.colors.primary};
`;
```

### Component Organization

- `src/components/ui/` - Reusable primitives (Button, Card, Badge, SearchBar, Sort)
- `src/components/layout/` - Layout containers (Header, FilterBar)
- **Barrel exports** via `index.ts` in each directory for clean imports

### Fixed Header Layout

- Header is `position: fixed`, `z-index: 20`, defined via CSS variable `--app-header-height`
- Content areas use `padding-top: var(--app-header-height)` and `calc(100vh - var(--app-header-height))` for height
- See [src/App.tsx](src/App.tsx) for the pattern

### Tauri Backend Integration

- **Entry point**: [src-tauri/src/lib.rs](src-tauri/src/lib.rs) exports `run()`
- **Custom commands**: Define in [src-tauri/src/commands.rs](src-tauri/src/commands.rs), register in `lib.rs`
- **Dev server**: Tauri listens on port 1420 for frontend (`src-tauri/tauri.conf.json`)
- **CSP policy**: `default-src asset: https://asset.localhost data: https`
- **Asset scope**: `$HOME/.local/share/com.openworld.leasebook/**`

## Code Style & Tooling

| Tool           | Config              | Notes                                               |
| -------------- | ------------------- | --------------------------------------------------- |
| **ESLint**     | `eslint.config.cjs` | Flat config, TypeScript + React + a11y plugins      |
| **Prettier**   | `.prettierrc`       | 100-char line width, single quotes, LF line endings |
| **TypeScript** | `tsconfig.json`     | Strict mode, unused locals/params checked           |

## Project-Specific Conventions

1. **No CSS files** - All styling goes in styled-components within `.tsx` files
2. **Theme typing** - [src/styles/styled.d.ts](src/styles/styled.d.ts) extends `DefaultTheme` for autocomplete
3. **Global styles** - [src/styles/global.ts](src/styles/global.ts) contains resets; injected via `GlobalStyle` in [src/main.tsx](src/main.tsx)
4. **Branch workflow** - Feature branches merge to `base` (default), current dev is `2-ui---basic-components`

## Developer Workflows

### Testing

- No test framework configured yet; add when needed for feature branches
- ESLint validation runs during development; fix issues before committing
- Type checking in strict mode ensures compile-time safety

### Debugging

**Frontend**: Open DevTools with `Ctrl+Shift+I` in dev mode (`pnpm tauri:dev`)
**Tauri backend**: Add println! macros in Rust, output appears in terminal running `pnpm tauri:dev`
**Desktop window**: Inspect element same as browser DevTools; respects CSP policy

### Android/Mobile Builds

- Gradle configs in `src-tauri/gen/android/` (auto-generated)
- Build via `pnpm tauri:build` with appropriate target flags
- Window size (800x600) may need responsive adjustments for mobile

## Tauri Command Patterns

Commands bridge frontend (TypeScript) and backend (Rust). Define and invoke like:

**Backend** ([src-tauri/src/commands.rs](src-tauri/src/commands.rs)):

```rust
#[tauri::command]
pub fn my_command(input: String) -> Result<String, String> {
  // Process input
  Ok(format!("Processed: {}", input))
}
```

**Register in** [src-tauri/src/lib.rs](src-tauri/src/lib.rs):

```rust
.invoke_handler(tauri::generate_handler![my_command])
```

**Frontend invocation** (React component):

```tsx
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('my_command', { input: 'data' });
```

**Return types**: Use `Result<T, String>` for error handling; serde serializes to JSON automatically.

## State Management with Context

Use React Context for shared state when viable (properties, user settings, filtered data).

**Pattern**:

1. Create context: `src/context/PropertyContext.tsx` with `React.createContext<State>()`
2. Provider component wraps tree in `src/main.tsx` after `ThemeProvider`
3. Components consume via `useContext(PropertyContext)`
4. Colocate state logic (reducers, effects) near context file

Avoid: Global state libraries until Context + useReducer becomes unwieldy. Keep context-dependent components in their own sub-directories under `src/components/` for clarity.

## When Adding Features

- **New UI component?** → Create in `src/components/ui/`, add to barrel export
- **Need Tauri backend command?** → Add to `src-tauri/src/commands.rs`, register in `lib.rs`, expose via `@tauri-apps/api`
- **New layout?** → Create in `src/components/layout/`
- **New colors/theme?** → Update [src/styles/theme.ts](src/styles/theme.ts) and rebuild (`pnpm dev` or `pnpm tauri:dev`)
- **Shared state?** → Create Context in `src/context/`, wrap at `src/main.tsx`

## Key Dependencies

- **@tauri-apps/api@2** - IPC and OS plugin APIs
- **@tauri-apps/plugin-fs** - File system access
- **@tauri-apps/plugin-opener** - Open URLs/files
- **lucide-react** - Icon library
- **styled-components@6** - CSS-in-JS (exclusive styling approach)

## Known Quirks

- Tauri dev mode filters Gdk-CRITICAL warnings on Linux via grep in `pnpm tauri:dev` script
- Vite watch ignores `src-tauri/` to prevent recompile conflicts (see `vite.config.ts`)
- Window size is 800x600 (defined in `tauri.conf.json`)
- App identifier: `com.openworldapps.leasebook` (used in asset scope paths)


## Generating commit messages

When generating commit messages, format in the following format:

```text
type(scope): summary

- change 1
- change 2
```
