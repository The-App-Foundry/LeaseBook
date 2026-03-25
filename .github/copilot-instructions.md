# Copilot Instructions for LeaseBook

## Quick Context

LeaseBook is a **cross-platform desktop property management app** (Tauri v2 + React 19 + TypeScript + Rust/Diesel). Full reference: [CLAUDE.md](../CLAUDE.md). Build/test commands differ from typical React apps due to Tauri desktop integration.

## Build & Test Commands

**Frontend:**

- `pnpm dev` — Vite dev server (port 1420)
- `pnpm build` — TypeScript + Vite build → `dist/`
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` — Prettier

**Full desktop app:**

- `pnpm tauri:dev` — Desktop app with hot-reload (filters Gdk warnings on Linux)
- `pnpm tauri:build` — Bundled desktop build

**Testing:**

- `pnpm test:browser` — Vitest browser tests (Playwright/Chromium); place test files alongside components as `*.test.tsx`
- `pnpm storybook` — Storybook dev server (port 6006); stories live alongside components as `*.stories.tsx`
- `pnpm test:vis` — Chromatic visual regression tests (CI)
- `pnpm build-storybook` — Build static Storybook

## Architecture

### Frontend: styled-components + Theme System

**No CSS files** — all styling goes in styled-components within `.tsx` files.

Critical patterns:

1. **Transient props** — `$` prefix (e.g., `$variant`, `$width`) prevents React DOM warnings
2. **Theme access** — `${({ theme }) => theme.colors.primary}` from [src/styles/theme.ts](src/styles/theme.ts)
3. **CSS Variables** — `--app-header-height`, `--spacing: 0.25rem` for layout
4. **Lucide icons** — wrap with `styled(IconName)` for sizing/color

### Component Organization

- `src/components/ui/` — Reusable primitives (Button, Card, Badge, SearchBar, Sort, Dropdown)
- `src/components/layout/` — Layout containers (Header, FilterBar, GridContainer)
- **Barrel exports** via `index.ts` in each directory
- **Fixed header**: `position: fixed`, `z-index: 20`, `--app-header-height` CSS var; content uses `padding-top: var(--app-header-height)`

### State Management

Use React Context for shared state. Pattern:

1. Create `src/context/FooContext.tsx` with `React.createContext<State>()`
2. Wrap tree in [src/main.tsx](src/main.tsx) after `ThemeProvider`
3. Consume via `useContext(FooContext)`

Avoid global state libraries until Context + useReducer is insufficient.

### Tauri Backend (Rust)

- **Commands**: Define in [src-tauri/src/commands.rs](src-tauri/src/commands.rs), register in [src-tauri/src/lib.rs](src-tauri/src/lib.rs) via `tauri::generate_handler![]`
- **Database**: SQLite via Diesel ORM. Models in [src-tauri/src/models.rs](src-tauri/src/models.rs), schema in [src-tauri/src/schema.rs](src-tauri/src/schema.rs), CRUD in [src-tauri/src/db/operations.rs](src-tauri/src/db/operations.rs)
- **Migrations**: [src-tauri/migrations/](src-tauri/migrations/) — run via `diesel migration run`
- **Spreadsheet import**: calamine-based parser in [src-tauri/src/parser.rs](src-tauri/src/parser.rs); column→lease mapping in [src-tauri/src/prop_map.rs](src-tauri/src/prop_map.rs)
- **Return types**: Use `Result<T, String>` — serde serializes to JSON automatically
- **CSP**: `default-src asset: https://asset.localhost data: https`

## Conventions

| Concern         | Rule                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Styling         | styled-components only; theme values, never hardcoded colors                                            |
| Theme types     | [src/styles/styled.d.ts](src/styles/styled.d.ts) extends `DefaultTheme`                                 |
| Global styles   | [src/styles/global.ts](src/styles/global.ts) injected via `GlobalStyle` in [src/main.tsx](src/main.tsx) |
| Branch workflow | Feature branches → PR → `base` (default branch)                                                         |
| Commits         | `type(scope): summary\n\n- change 1\n- change 2`                                                        |

## When Adding Features

- **New UI component** → `src/components/ui/`, add to `index.ts` barrel
- **New layout** → `src/components/layout/`
- **New theme tokens** → [src/styles/theme.ts](src/styles/theme.ts)
- **Shared state** → `src/context/`, wrap in [src/main.tsx](src/main.tsx)
- **Tauri command** → [src-tauri/src/commands.rs](src-tauri/src/commands.rs) + register in `lib.rs`
- **DB model change** → add Diesel migration, update [src-tauri/src/models.rs](src-tauri/src/models.rs) and [src-tauri/src/schema.rs](src-tauri/src/schema.rs)

## Key Dependencies

- **@tauri-apps/api@2** — IPC and OS plugin APIs
- **@tauri-apps/plugin-fs** — File system access
- **@tauri-apps/plugin-dialog** — Native file/dialog pickers
- **@tauri-apps/plugin-opener** — Open URLs/files
- **lucide-react** — Icon library
- **styled-components@6** — CSS-in-JS (exclusive)
- **Diesel (Rust)** — SQLite ORM; `diesel_cli` needed for migrations

## Known Quirks

- Tauri dev mode filters Gdk-CRITICAL warnings on Linux via grep in the `tauri:dev` script
- Vite watch ignores `src-tauri/` to prevent recompile conflicts (see `vite.config.ts`)
- Window size 800×600 defined in `tauri.conf.json`; app identifier: `com.openworldapps.leasebook`
- Vitest browser tests require Playwright installed (`pnpm exec playwright install`)

## Generating Commit Messages

```text
type(scope): summary

- change 1
- change 2
```
