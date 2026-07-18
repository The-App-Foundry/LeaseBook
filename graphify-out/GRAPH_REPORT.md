# Graph Report - .  (2026-07-18)

## Corpus Check
- 163 files · ~78,973 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 684 nodes · 1049 edges · 121 communities (52 shown, 69 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.77)
- Token cost: 84,279 input · 5,135 output

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
- Manager Detection Utility
- Tauri Backend Entry (lib.rs)
- Theme & Agent Memory
- Storybook Preview & Vitest Setup
- Vitest Example Component
- ESLint Package
- ESLint Config Prettier Package
- ESLint RC Package
- ESLint TS Import Resolver Package
- ESLint Import Plugin Package
- ESLint A11y Plugin Package
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

## God Nodes (most connected - your core abstractions)
1. `map_spreadsheet_to_leases()` - 24 edges
2. `scripts` - 16 edges
3. `compilerOptions` - 16 edges
4. `parse_spreadsheet_from_path()` - 13 edges
5. `Lease` - 13 edges
6. `Cell` - 12 edges
7. `Manager` - 12 edges
8. `get_paginated_leases_with_managers()` - 11 edges
9. `map_sheet_to_leases()` - 11 edges
10. `Spreadsheet` - 11 edges

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

## Communities (121 total, 69 thin omitted)

### Community 0 - "Spreadsheet Import Parsing"
Cohesion: 0.10
Nodes (49): HashSet, NaiveDate, NaiveDateTime, Self, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases() (+41 more)

### Community 1 - "App Shell & Filter Grid"
Cohesion: 0.06
Nodes (31): DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, ListPageContent, ListPageProps, Page, PaginatedResponse (+23 more)

### Community 2 - "UI Primitives (Badge/Sort/Card/Dropdown)"
Cohesion: 0.05
Nodes (30): Badge(), Card(), CardProps, DropdownMenuProps, AllVariants, Emerald, Gray, ProspectBadge (+22 more)

### Community 3 - "Tauri Lease/Manager Commands"
Cohesion: 0.22
Nodes (34): DbLease, From, delete(), edit_lease(), edit_manager(), import_parsed_leases(), last_manager_id(), lease() (+26 more)

### Community 4 - "Diesel DB Operations"
Cohesion: 0.23
Nodes (31): count_leases(), create_lease(), create_manager(), delete_lease(), delete_manager(), get_all_leases_with_managers(), get_last_manager_id(), get_lease() (+23 more)

### Community 5 - "NPM Runtime Dependencies"
Cohesion: 0.06
Nodes (31): bootstrap, @fontsource/inter, lucide-react, dependencies, bootstrap, @fontsource/inter, lucide-react, react (+23 more)

### Community 6 - "TypeScript Compiler & Storybook Config"
Cohesion: 0.06
Nodes (30): DOM, DOM.Iterable, ES2021, .storybook, .storybook/stories/layout/FilterBar.stories.tsx, .storybook/stories/ui/Badge.stories.tsx, .storybook/stories/ui/Button.stories.tsx, .storybook/stories/ui/Card.stories.tsx (+22 more)

### Community 7 - "Tauri App Config & Icons"
Cohesion: 0.07
Nodes (27): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, security (+19 more)

### Community 8 - "Spreadsheet Parser (calamine)"
Cohesion: 0.14
Nodes (24): AsRef, Data, Display, Formatter, Path, PathBuf, Range, Sheets (+16 more)

### Community 9 - "NPM Scripts"
Cohesion: 0.09
Nodes (21): name, packageManager, private, scripts, build, build-storybook, dev, format (+13 more)

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
Cohesion: 0.18
Nodes (10): getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS, Empty, ManyItems, sampleProperty, Story (+2 more)

### Community 14 - "Lease/Manager Type Definitions"
Cohesion: 0.21
Nodes (9): PropertyProps, PropertyDetailProps, WorkbookImportFlowProps, FilterGridContextType, Lease, Manager, ManagerCreate, ManagerEdit (+1 more)

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
Cohesion: 0.20
Nodes (9): ActiveLease, Default, defaultData, Expired, ExpiringSoon, MultipleProperties, Prospect, Qualified (+1 more)

### Community 21 - "Vite Node TS Config"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 22 - "Property Form Editing"
Cohesion: 0.31
Nodes (8): dateToUnixTimestamp(), DbLease, dbLeaseToFrontend(), FormErrors, PropertyForm(), PropertyFormProps, STAGE_OPTIONS, unixTimestampToIso()

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

### Community 28 - "Property Card Notes"
Cohesion: 0.70
Nodes (4): formatNoteText(), Property(), stripHtml(), useClampedNote()

### Community 29 - "Android Gradle Wrapper Script"
Cohesion: 0.60
Nodes (3): gradlew script, die(), warn()

### Community 30 - "Manager Detection Utility"
Cohesion: 0.70
Nodes (4): detectManagers(), parseEntry(), splitEntries(), uid()

### Community 31 - "Tauri Backend Entry (lib.rs)"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

## Knowledge Gaps
- **276 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+271 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **69 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `NPM Runtime Dependencies` to `NPM Scripts`, `Lease Detail & RTF Editing`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `dompurify` connect `Lease Detail & RTF Editing` to `NPM Runtime Dependencies`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `map_spreadsheet_to_leases()` (e.g. with `parse_spreadsheet_to_leases()` and `filters_to_selected_sheet_name()`) actually correct?**
  _`map_spreadsheet_to_leases()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _276 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Spreadsheet Import Parsing` be split into smaller, more focused modules?**
  _Cohesion score 0.09796806966618288 - nodes in this community are weakly interconnected._
- **Should `App Shell & Filter Grid` be split into smaller, more focused modules?**
  _Cohesion score 0.058673469387755105 - nodes in this community are weakly interconnected._
- **Should `UI Primitives (Badge/Sort/Card/Dropdown)` be split into smaller, more focused modules?**
  _Cohesion score 0.05121951219512195 - nodes in this community are weakly interconnected._