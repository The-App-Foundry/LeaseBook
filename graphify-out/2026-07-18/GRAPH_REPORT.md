# Graph Report - LeaseBook  (2026-07-18)

## Corpus Check
- 105 files · ~80,074 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 749 nodes · 1126 edges · 139 communities (62 shown, 77 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5526aa21`
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
- App.tsx
- Property.stories.tsx
- Sort.tsx
- Badge.stories.tsx
- Dropdown.stories.tsx
- package.json
- index.ts
- managerDetect.ts
- eslint-plugin-jsx-a11y
- @fontsource/inter
- lucide-react
- react
- react-bootstrap
- react-dom
- @tauri-apps/api
- @tauri-apps/plugin-dialog
- @tauri-apps/plugin-fs

## God Nodes (most connected - your core abstractions)
1. `map_spreadsheet_to_leases()` - 24 edges
2. `scripts` - 16 edges
3. `compilerOptions` - 16 edges
4. `create_lease()` - 13 edges
5. `get_leases_paginated()` - 13 edges
6. `parse_spreadsheet_from_path()` - 13 edges
7. `Lease` - 13 edges
8. `Cell` - 12 edges
9. `Manager` - 12 edges
10. `get_paginated_leases_with_managers()` - 11 edges

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

## Communities (139 total, 77 thin omitted)

### Community 0 - "Spreadsheet Import Parsing"
Cohesion: 0.10
Nodes (47): HashSet, NaiveDate, NaiveDateTime, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases(), normalize_key() (+39 more)

### Community 1 - "App Shell & Filter Grid"
Cohesion: 0.08
Nodes (24): STAGE_COLORS, HeaderProps, compareOptionalNumbers(), DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, FilterGridContext (+16 more)

### Community 2 - "UI Primitives (Badge/Sort/Card/Dropdown)"
Cohesion: 0.18
Nodes (10): Card(), CardProps, CustomHeight, CustomSize, CustomWidth, Default, MultipleSizes, SpaceBetween (+2 more)

### Community 3 - "Tauri Lease/Manager Commands"
Cohesion: 0.22
Nodes (34): DbLease, From, delete(), edit_lease(), edit_manager(), import_parsed_leases(), last_manager_id(), lease() (+26 more)

### Community 4 - "Diesel DB Operations"
Cohesion: 0.21
Nodes (35): count_leases(), create_lease(), create_manager(), current_unix_timestamp(), delete_lease(), delete_manager(), get_all_leases_with_managers(), get_last_manager_id() (+27 more)

### Community 5 - "NPM Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, react, @tauri-apps/plugin-opener, @tiptap/extension-link, @tiptap/extension-underline, @tiptap/pm, @tiptap/react, @tiptap/starter-kit (+7 more)

### Community 6 - "TypeScript Compiler & Storybook Config"
Cohesion: 0.06
Nodes (30): DOM, DOM.Iterable, ES2021, .storybook, .storybook/stories/layout/FilterBar.stories.tsx, .storybook/stories/ui/Badge.stories.tsx, .storybook/stories/ui/Button.stories.tsx, .storybook/stories/ui/Card.stories.tsx (+22 more)

### Community 7 - "Tauri App Config & Icons"
Cohesion: 0.07
Nodes (27): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, security (+19 more)

### Community 8 - "Spreadsheet Parser (calamine)"
Cohesion: 0.12
Nodes (26): AsRef, Data, Display, Formatter, Path, PathBuf, Range, Sheets (+18 more)

### Community 9 - "NPM Scripts"
Cohesion: 0.12
Nodes (16): scripts, build, build-storybook, dev, format, lint, lint:fix, preview (+8 more)

### Community 10 - "Lease Detail & RTF Editing"
Cohesion: 0.15
Nodes (15): dompurify, dompurify, dateToUnix(), DbLeaseResult, EditFields, getStageInfo(), looksLikePlainText(), normaliseDate() (+7 more)

### Community 11 - "Workbook Import Flow"
Cohesion: 0.20
Nodes (14): ALIASES, autoDetectHeaders(), BackendLease, BackendLeaseManager, convertBackendLeasesToUi(), FIELDS, formatExpirationDate(), getErrorMessage() (+6 more)

### Community 12 - "Button Component"
Cohesion: 0.16
Nodes (11): Button(), ButtonProps, variantClass, AllVariants, Default, Destructive, FilterButton, Ghost (+3 more)

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
Nodes (9): Default, Lease, LeaseManager, DateTime, LeaseManager, Option, Self, String (+1 more)

### Community 18 - "Tauri Capabilities/Permissions"
Cohesion: 0.18
Nodes (10): core:default, fs:default, main, opener:default, sql:default, description, identifier, permissions (+2 more)

### Community 19 - "SearchBar Component"
Cohesion: 0.22
Nodes (8): SearchBar(), SearchBarProps, CustomPlaceholder, Default, Interactive, Story, WithInteractionTest, WithValue

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
Cohesion: 0.25
Nodes (7): **/*, ../tsconfig.json, compilerOptions, composite, extends, include, ../src

### Community 24 - "Android Gradle Rust Plugin"
Cohesion: 0.47
Nodes (4): Plugin, Project, Config, RustPlugin

### Community 25 - "Android MainActivity"
Cohesion: 0.40
Nodes (3): Bundle, MainActivity, TauriActivity

### Community 27 - "ESLint Flat Config"
Cohesion: 0.40
Nodes (4): compat, { FlatCompat }, js, legacy

### Community 29 - "Android Gradle Wrapper Script"
Cohesion: 0.60
Nodes (3): gradlew script, die(), warn()

### Community 31 - "Tauri Backend Entry (lib.rs)"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

### Community 35 - "ESLint Package"
Cohesion: 0.18
Nodes (13): formatNoteText(), Property(), PropertyProps, stripHtml(), useClampedNote(), PropertyDetailProps, WorkbookImportFlowProps, FilterGridContextType (+5 more)

### Community 40 - "GridContainer.tsx"
Cohesion: 0.29
Nodes (6): Empty, ManyItems, sampleProperty, Story, WithCards, WithContent

### Community 121 - "Lease"
Cohesion: 0.31
Nodes (8): dateToUnixTimestamp(), DbLease, dbLeaseToFrontend(), FormErrors, PropertyForm(), PropertyFormProps, STAGE_OPTIONS, unixTimestampToIso()

### Community 122 - "App.tsx"
Cohesion: 0.17
Nodes (9): ListPageContent, ListPageProps, Page, getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS, Tab (+1 more)

### Community 123 - "Property.stories.tsx"
Cohesion: 0.20
Nodes (9): ActiveLease, Default, defaultData, Expired, ExpiringSoon, MultipleProperties, Prospect, Qualified (+1 more)

### Community 124 - "Sort.tsx"
Cohesion: 0.22
Nodes (6): SortDirection, SortProps, Default, InContext, Story, WithInteractionTest

### Community 125 - "Badge.stories.tsx"
Cohesion: 0.22
Nodes (8): AllVariants, Emerald, Gray, ProspectBadge, QualifiedBadge, Story, Transparent, WithNumber

### Community 126 - "Dropdown.stories.tsx"
Cohesion: 0.29
Nodes (6): Default, ManyItems, SortByDropdown, Story, WithIcons, WithInteractionTest

### Community 127 - "package.json"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

### Community 129 - "managerDetect.ts"
Cohesion: 0.70
Nodes (4): detectManagers(), parseEntry(), splitEntries(), uid()

## Knowledge Gaps
- **320 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+315 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **77 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Runtime Dependencies` to `@fontsource/inter`, `lucide-react`, `react-bootstrap`, `react-dom`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`, `Lease Detail & RTF Editing`, `@tauri-apps/plugin-fs`, `Property Card Notes`, `package.json`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `dompurify` connect `Lease Detail & RTF Editing` to `NPM Runtime Dependencies`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `map_spreadsheet_to_leases()` (e.g. with `parse_spreadsheet_to_leases()` and `filters_to_selected_sheet_name()`) actually correct?**
  _`map_spreadsheet_to_leases()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _320 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Spreadsheet Import Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.10448979591836735 - nodes in this community are weakly interconnected._
- **Should `App Shell & Filter Grid` be split into smaller, more focused modules?**
  _Cohesion score 0.07564102564102564 - nodes in this community are weakly interconnected._
- **Should `NPM Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._