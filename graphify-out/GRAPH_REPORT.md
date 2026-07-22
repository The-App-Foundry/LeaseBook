# Graph Report - LeaseBook  (2026-07-22)

## Corpus Check
- 113 files · ~85,946 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 936 nodes · 1613 edges · 145 communities (67 shown, 78 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `158369f0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Spreadsheet Import Parsing
- App Shell & Filter Grid
- UI Primitives (Badge/Sort/Card/Dropdown)
- Tauri Lease/Manager Commands
- Diesel DB Operations
- NPM Runtime Dependencies
- TypeScript Compiler & Storybook Config
- Tauri App Config & Icons
- Spreadsheet Parser (calamine)
- NPM Scripts
- Lease Detail & RTF Editing
- Workbook Import Flow
- Button Component
- Grid Container Pagination
- Lease/Manager Type Definitions
- Diesel ORM Models
- NPM Dev Tooling Deps
- Import Pipeline Lease Struct
- Tauri Capabilities/Permissions
- SearchBar Component
- Property Card Storybook Stories
- Vite Node TS Config
- Property Form Editing
- Storybook TS Config
- Android Gradle Rust Plugin
- Android MainActivity
- Android Gradle Build Task
- ESLint Flat Config
- Property Card Notes
- Android Gradle Wrapper Script
- Tauri Backend Entry (lib.rs)
- Storybook Preview & Vitest Setup
- Vitest Example Component
- ESLint Package
- ESLint Config Prettier Package
- ESLint RC Package
- ESLint TS Import Resolver Package
- ESLint Import Plugin Package
- GridContainer.tsx
- ESLint Prettier Plugin Package
- ESLint React Plugin Package
- ESLint React Hooks Plugin Package
- ESLint Storybook Plugin Package
- jsdom Package
- Playwright Package
- Playwright Test Package
- Storybook Package
- Storybook A11y Addon Package
- Storybook Docs Addon Package
- Storybook Vitest Addon Package
- Tauri CLI Package
- Testing Library Jest-DOM Package
- Testing Library React Package
- Testing Library User-Event Package
- DOMPurify Types Package
- React Types Package
- React-DOM Types Package
- TypeScript Package
- TypeScript ESLint Plugin Package
- TypeScript ESLint Parser Package
- Vite Package
- Vite React Plugin Package
- Vitest Package
- Vitest Browser React Package
- Vitest Coverage Package
- Storybook Main Config
- Mobile UI Asset
- App Logo Asset
- App Icon Asset
- App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- iOS App Icon Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Tile Logo Asset
- Windows Store Logo Asset
- Lease
- logging.rs
- Property.stories.tsx
- package.json
- App.tsx
- @fontsource/inter
- Sort.tsx
- Badge.stories.tsx
- App.test.tsx
- eslint-plugin-jsx-a11y
- package.json
- Dropdown.stories.tsx
- react
- @chromatic-com/storybook
- @fontsource/inter
- index.ts
- lucide-react
- react-bootstrap
- @tauri-apps/plugin-dialog
- @tauri-apps/plugin-fs
- @tiptap/pm
- react
- @tiptap/starter-kit

## God Nodes (most connected - your core abstractions)
1. `AppError` - 52 edges
2. `AuthManager` - 48 edges
3. `map_spreadsheet_to_leases()` - 24 edges
4. `scripts` - 16 edges
5. `compilerOptions` - 16 edges
6. `AuthStatus` - 13 edges
7. `AuthConfig` - 13 edges
8. `create_lease()` - 13 edges
9. `get_leases_paginated()` - 13 edges
10. `parse_spreadsheet_from_path()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PropertyDetail()` --references--> `dompurify`  [EXTRACTED]
  src/components/layout/PropertyDetail.tsx → package.json
- `parse_spreadsheet()` --calls--> `parse_spreadsheet_from_path()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/parser.rs
- `parse_spreadsheet_to_leases()` --calls--> `parse_spreadsheet_from_path()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/parser.rs
- `parse_spreadsheet_to_leases()` --calls--> `map_spreadsheet_to_leases()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/prop_map.rs
- `new_lease()` --calls--> `create_lease()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/db/operations.rs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **LeaseBook Branding Assets** — src_tauri_icons_64x64, src_tauri_icons_square107x107logo, src_tauri_icons_square142x142logo, src_tauri_icons_square150x150logo, src_tauri_icons_square284x284logo, src_tauri_icons_square30x30logo, src_tauri_icons_square310x310logo, src_tauri_icons_square44x44logo, src_tauri_icons_square71x71logo, src_tauri_icons_square89x89logo, src_tauri_icons_storelogo, src_tauri_icons_icon, src_tauri_icons_ios_appicon_20x20_1x, src_tauri_icons_ios_appicon_20x20_2x_1, src_tauri_icons_ios_appicon_20x20_2x, src_tauri_icons_ios_appicon_20x20_3x, src_tauri_icons_ios_appicon_29x29_1x, src_tauri_icons_ios_appicon_29x29_2x_1, src_tauri_icons_ios_appicon_29x29_2x, src_tauri_icons_ios_appicon_29x29_3x [EXTRACTED 1.00]
- **LeaseBook iOS App Icons** — src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_appicon_512_2x, src_tauri_icons_ios_appicon_60x60_2x, src_tauri_icons_ios_appicon_60x60_3x, src_tauri_icons_ios_appicon_76x76_1x, src_tauri_icons_ios_appicon_76x76_2x, src_tauri_icons_ios_appicon_83_5x83_5_2x [EXTRACTED 1.00]

## Communities (145 total, 78 thin omitted)

### Community 0 - "Spreadsheet Import Parsing"
Cohesion: 0.10
Nodes (49): HashSet, NaiveDate, NaiveDateTime, Self, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases() (+41 more)

### Community 1 - "App Shell & Filter Grid"
Cohesion: 0.10
Nodes (20): STAGE_COLORS, compareOptionalNumbers(), DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, FilterGridContext, FilterGridProvider() (+12 more)

### Community 2 - "UI Primitives (Badge/Sort/Card/Dropdown)"
Cohesion: 0.22
Nodes (8): SearchBar(), SearchBarProps, CustomPlaceholder, Default, Interactive, Story, WithInteractionTest, WithValue

### Community 3 - "Tauri Lease/Manager Commands"
Cohesion: 0.11
Nodes (56): AppHandle, CommandResult, DbLease, auth_login(), auth_logout(), auth_status(), browser_passkey_login(), browser_passkey_registration() (+48 more)

### Community 4 - "Diesel DB Operations"
Cohesion: 0.21
Nodes (35): count_leases(), create_lease(), create_manager(), current_unix_timestamp(), delete_lease(), delete_manager(), get_all_leases_with_managers(), get_last_manager_id() (+27 more)

### Community 5 - "NPM Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dompurify, dependencies, dompurify, react-dom, @tauri-apps/api, @tauri-apps/plugin-opener, @tiptap/extension-link, @tiptap/extension-underline (+7 more)

### Community 6 - "TypeScript Compiler & Storybook Config"
Cohesion: 0.06
Nodes (32): DOM, DOM.Iterable, ES2021, .storybook, .storybook/stories/layout/FilterBar.stories.tsx, .storybook/stories/ui/Badge.stories.tsx, .storybook/stories/ui/Button.stories.tsx, .storybook/stories/ui/Card.stories.tsx (+24 more)

### Community 7 - "Tauri App Config & Icons"
Cohesion: 0.07
Nodes (27): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, security (+19 more)

### Community 8 - "Spreadsheet Parser (calamine)"
Cohesion: 0.08
Nodes (35): AsRef, Data, DieselError, Into, Range, Sheets, pool_error(), Display (+27 more)

### Community 9 - "NPM Scripts"
Cohesion: 0.09
Nodes (21): name, packageManager, private, scripts, build, build-storybook, dev, format (+13 more)

### Community 10 - "Lease Detail & RTF Editing"
Cohesion: 0.17
Nodes (13): dateToUnix(), DbLeaseResult, EditFields, getStageInfo(), looksLikePlainText(), normaliseDate(), PropertyDetail(), RtfToolbarProps (+5 more)

### Community 11 - "Workbook Import Flow"
Cohesion: 0.17
Nodes (17): ALIASES, autoDetectHeaders(), BackendLease, BackendLeaseManager, convertBackendLeasesToUi(), FIELDS, formatExpirationDate(), getFileName() (+9 more)

### Community 12 - "Button Component"
Cohesion: 0.05
Nodes (33): Badge(), Button(), ButtonProps, variantClass, DropdownMenuProps, SortDirection, SortProps, AllVariants (+25 more)

### Community 13 - "Grid Container Pagination"
Cohesion: 0.11
Nodes (17): 1. Theme System, 2. Styled-Components Conventions, 3. Component Organization, 4. Tauri Backend, 5. TypeScript Standards, Code Reviews, Communication Protocol, Development Commands Reference (+9 more)

### Community 14 - "Lease/Manager Type Definitions"
Cohesion: 0.12
Nodes (16): 1. Theme System, 2. Styled-Components Conventions, 3. Component Organization, 4. Tauri Backend, 5. TypeScript Standards, Code Reviews, Communication Protocol, Development Commands Reference (+8 more)

### Community 15 - "Diesel ORM Models"
Cohesion: 0.30
Nodes (11): Lease, LeaseManager, LeasesManagers, NewLease, NewManager, Option, String, UpdateLease (+3 more)

### Community 16 - "NPM Dev Tooling Deps"
Cohesion: 0.18
Nodes (11): @chromatic-com/storybook, cross-env, devDependencies, @chromatic-com/storybook, cross-env, prettier, @storybook/react-vite, @vitest/browser-playwright (+3 more)

### Community 17 - "Import Pipeline Lease Struct"
Cohesion: 0.20
Nodes (9): Lease, LeaseManager, DateTime, Default, LeaseManager, Option, Self, String (+1 more)

### Community 18 - "Tauri Capabilities/Permissions"
Cohesion: 0.18
Nodes (10): core:default, fs:default, main, opener:default, sql:default, description, identifier, permissions (+2 more)

### Community 19 - "SearchBar Component"
Cohesion: 0.18
Nodes (10): Card(), CardProps, CustomHeight, CustomSize, CustomWidth, Default, MultipleSizes, SpaceBetween (+2 more)

### Community 20 - "Property Card Storybook Stories"
Cohesion: 0.14
Nodes (13): Architecture, Build & Test Commands, Component Organization, Conventions, Copilot Instructions for LeaseBook, Frontend: styled-components + Theme System, Generating Commit Messages, Key Dependencies (+5 more)

### Community 21 - "Vite Node TS Config"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 22 - "Property Form Editing"
Cohesion: 0.22
Nodes (8): 1. Project Layout & Architecture, 2. React Components & Custom Hooks Strategy, 3. Secure IPC Command Patterns, 4. Idiomatic Rust & Memory Boundaries, 5. Workflow Strategy, Correct React + TypeScript Setup, Correct Rust Backend Command, Tauri v2 + React Development Protocol

### Community 23 - "Storybook TS Config"
Cohesion: 0.20
Nodes (9): **/*, ../tsconfig.json, compilerOptions, composite, exclude, extends, include, ../graphify-out (+1 more)

### Community 24 - "Android Gradle Rust Plugin"
Cohesion: 0.47
Nodes (4): Plugin, Project, Config, RustPlugin

### Community 25 - "Android MainActivity"
Cohesion: 0.40
Nodes (3): Bundle, MainActivity, TauriActivity

### Community 27 - "ESLint Flat Config"
Cohesion: 0.40
Nodes (4): compat, { FlatCompat }, js, legacy

### Community 28 - "Property Card Notes"
Cohesion: 0.11
Nodes (32): Mutex, Passkey, PasskeyAuthentication, PasskeyRegistration, auth_error(), auth_file_path(), AuthConfig, AuthFactor (+24 more)

### Community 29 - "Android Gradle Wrapper Script"
Cohesion: 0.60
Nodes (3): gradlew script, die(), warn()

### Community 31 - "Tauri Backend Entry (lib.rs)"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

### Community 35 - "ESLint Package"
Cohesion: 0.17
Nodes (14): formatNoteText(), Property(), PropertyProps, stripHtml(), useClampedNote(), PropertyDetailProps, PropertyFormProps, WorkbookImportFlowProps (+6 more)

### Community 37 - "ESLint RC Package"
Cohesion: 0.17
Nodes (25): Drop, FnOnce, ceremony_page(), CeremonyMode, CeremonyResult, CleanupGuard, completion_page(), content_length() (+17 more)

### Community 40 - "GridContainer.tsx"
Cohesion: 0.18
Nodes (10): getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS, Empty, ManyItems, sampleProperty, Story (+2 more)

### Community 121 - "Lease"
Cohesion: 0.36
Nodes (7): dateToUnixTimestamp(), DbLease, dbLeaseToFrontend(), FormErrors, PropertyForm(), STAGE_OPTIONS, unixTimestampToIso()

### Community 122 - "logging.rs"
Cohesion: 0.14
Nodes (15): InitError, init(), InitLoggingError, log_dir(), LogGuard, Display, Error, Formatter (+7 more)

### Community 123 - "Property.stories.tsx"
Cohesion: 0.20
Nodes (9): ActiveLease, Default, defaultData, Expired, ExpiringSoon, MultipleProperties, Prospect, Qualified (+1 more)

### Community 125 - "App.tsx"
Cohesion: 0.11
Nodes (16): AuthenticatedApp(), AuthenticatedAppProps, AuthStatus, ChangePasswordForm(), ChangePasswordFormProps, ListPageContent, ListPageProps, LockedScreen() (+8 more)

### Community 126 - "@fontsource/inter"
Cohesion: 0.30
Nodes (11): change_password_requires_current_password_and_replaces_hash(), create_password_persists_setup_without_storing_plaintext(), disable_password_requires_current_password_and_removes_config(), login_requires_the_created_password_and_logout_clears_session(), mfa_requires_password_then_passkey_when_both_local_methods_are_enabled(), passkey_login_requires_a_registered_passkey(), passkey_only_auth_prompts_for_passkey_first(), passkey_registration_requires_authenticated_session() (+3 more)

### Community 127 - "Sort.tsx"
Cohesion: 0.22
Nodes (6): SortDirection, SortProps, Default, InContext, Story, WithInteractionTest

### Community 128 - "Badge.stories.tsx"
Cohesion: 0.22
Nodes (8): AllVariants, Emerald, Gray, ProspectBadge, QualifiedBadge, Story, Transparent, WithNumber

### Community 129 - "App.test.tsx"
Cohesion: 0.17
Nodes (6): HeaderProps, Tab, TabBarProps, Default, Story, WithContent

### Community 131 - "package.json"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

### Community 132 - "Dropdown.stories.tsx"
Cohesion: 0.29
Nodes (6): Default, ManyItems, SortByDropdown, Story, WithIcons, WithInteractionTest

## Knowledge Gaps
- **329 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+324 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Runtime Dependencies` to `package.json`, `react`, `@fontsource/inter`, `index.ts`, `lucide-react`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`, `@tiptap/pm`, `react`, `@tiptap/starter-kit`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `PropertyDetail()` connect `Lease Detail & RTF Editing` to `App.tsx`, `NPM Runtime Dependencies`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `dompurify` connect `NPM Runtime Dependencies` to `Lease Detail & RTF Editing`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _329 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Spreadsheet Import Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.09796806966618288 - nodes in this community are weakly interconnected._
- **Should `App Shell & Filter Grid` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._
- **Should `Tauri Lease/Manager Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.11466165413533834 - nodes in this community are weakly interconnected._