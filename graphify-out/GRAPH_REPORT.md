# Graph Report - LeaseBook  (2026-08-05)

## Corpus Check
- 123 files · ~89,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1034 nodes · 1980 edges · 145 communities (64 shown, 81 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f1c7c5b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Auth
- Commands
- Operations
- Prop Map
- Parser Tests
- Passkey Browser
- Tsconfig
- Tauri.conf
- Models
- Gridcontainer.stories
- App
- Logging
- Stagecolors
- Leasebook Fullstack Engineer
- SKILL
- Leasestatus
- Filtergridcontext
- Package
- Workbookimportflow
- Package
- Copilot Instructions
- Propertydetail
- Button.stories
- Auth Tests
- Managerdetect
- Card.stories
- Package
- Default
- Badge.stories
- Searchbar.stories
- Property
- Property.stories
- Tsconfig
- Gridcontainer
- Dropdown.stories
- SKILL
- Tsconfig.node
- Propertyform
- Spreadsheet
- Header.stories
- Filtergridcontext.test
- @tauri-apps/cli
- @tauri-apps/api
- Package
- Rustplugin
- Mainactivity
- Buildtask
- Eslint.config
- Gradlew
- Sort.stories
- @tiptap/extension-link
- Lib
- @tiptap/react
- Preview
- Helloworld
- Package
- Diesel Query Gotchas
- CLAUDE
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Package
- Main
- List View Wire Contract
- Leasebook Mobile
- Leasebook
- 64x64
- Icon
- Appicon 20x20@1x
- Appicon 20x20@2x
- Appicon 20x20@2x 1
- Appicon 20x20@3x
- Appicon 29x29@1x
- Appicon 29x29@2x
- Appicon 29x29@2x 1
- Appicon 29x29@3x
- Appicon 40x40@1x
- Appicon 40x40@2x
- Appicon 40x40@2x 1
- Appicon 40x40@3x
- Appicon 512@2x
- Appicon 60x60@2x
- Appicon 60x60@3x
- Appicon 76x76@1x
- Appicon 76x76@2x
- Appicon 83.5x83.5@2x
- Square107x107logo
- Square142x142logo
- Square150x150logo
- Square284x284logo
- Square30x30logo
- Square310x310logo
- Square44x44logo
- Square71x71logo
- Square89x89logo
- Storelogo

## God Nodes (most connected - your core abstractions)
1. `AppError` - 57 edges
2. `AuthManager` - 55 edges
3. `map_spreadsheet_to_leases()` - 25 edges
4. `setup_db()` - 22 edges
5. `parse_spreadsheet_from_path()` - 19 edges
6. `Lease` - 19 edges
7. `scripts` - 18 edges
8. `seed_stage()` - 18 edges
9. `create_lease()` - 17 edges
10. `create_manager()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `manyLeases()` --calls--> `createLease()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `withGrid()` --calls--> `createFilterGridValue()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `PropertyDetail()` --references--> `dompurify`  [EXTRACTED]
  src/components/layout/PropertyDetail.tsx → package.json
- `Release Workflow` --references--> `LeaseBook Project`  [INFERRED]
  .github/workflows/release.yml → CLAUDE.md
- `clear_all_data()` --calls--> `clear_all_records()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/db/operations.rs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **LeaseBook Branding Assets** — src_tauri_icons_64x64, src_tauri_icons_square107x107logo, src_tauri_icons_square142x142logo, src_tauri_icons_square150x150logo, src_tauri_icons_square284x284logo, src_tauri_icons_square30x30logo, src_tauri_icons_square310x310logo, src_tauri_icons_square44x44logo, src_tauri_icons_square71x71logo, src_tauri_icons_square89x89logo, src_tauri_icons_storelogo, src_tauri_icons_icon, src_tauri_icons_ios_appicon_20x20_1x, src_tauri_icons_ios_appicon_20x20_2x_1, src_tauri_icons_ios_appicon_20x20_2x, src_tauri_icons_ios_appicon_20x20_3x, src_tauri_icons_ios_appicon_29x29_1x, src_tauri_icons_ios_appicon_29x29_2x_1, src_tauri_icons_ios_appicon_29x29_2x, src_tauri_icons_ios_appicon_29x29_3x [EXTRACTED 1.00]
- **LeaseBook iOS App Icons** — src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_appicon_512_2x, src_tauri_icons_ios_appicon_60x60_2x, src_tauri_icons_ios_appicon_60x60_3x, src_tauri_icons_ios_appicon_76x76_1x, src_tauri_icons_ios_appicon_76x76_2x, src_tauri_icons_ios_appicon_83_5x83_5_2x [EXTRACTED 1.00]

## Communities (145 total, 81 thin omitted)

### Community 0 - "Auth"
Cohesion: 0.11
Nodes (32): Mutex, Passkey, PasskeyAuthentication, PasskeyRegistration, auth_error(), auth_file_path(), AuthConfig, AuthFactor (+24 more)

### Community 1 - "Commands"
Cohesion: 0.10
Nodes (63): AppHandle, CommandResult, DbLease, auth_login(), auth_logout(), auth_status(), browser_passkey_login(), browser_passkey_registration() (+55 more)

### Community 2 - "Operations"
Cohesion: 0.12
Nodes (60): clear_all_records(), count_leases(), create_lease(), create_manager(), current_unix_timestamp(), delete_lease(), delete_manager(), get_all_leases_with_managers() (+52 more)

### Community 3 - "Prop Map"
Cohesion: 0.09
Nodes (51): HashSet, NaiveDate, NaiveDateTime, Self, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases() (+43 more)

### Community 4 - "Parser Tests"
Cohesion: 0.08
Nodes (42): AsRef, Data, DieselError, Into, Range, Sheets, pool_error(), Display (+34 more)

### Community 5 - "Passkey Browser"
Cohesion: 0.17
Nodes (25): Drop, FnOnce, ceremony_page(), CeremonyMode, CeremonyResult, CleanupGuard, completion_page(), content_length() (+17 more)

### Community 6 - "Tsconfig"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2021, .storybook/**/*.ts, .storybook/**/*.tsx, compilerOptions, allowImportingTsExtensions, isolatedModules (+18 more)

### Community 7 - "Tauri.conf"
Cohesion: 0.07
Nodes (27): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, security (+19 more)

### Community 8 - "Models"
Cohesion: 0.14
Nodes (20): Err, FromStr, Lease, LeaseManager, LeasesManagers, NewLease, NewManager, ParseStageError (+12 more)

### Community 9 - "Gridcontainer.stories"
Cohesion: 0.08
Nodes (32): renderList(), renderToggle(), BASE_FILTER_GRID_VALUE, createFilterGridValue(), createLease(), createManager(), FilterGridValue, isoInDays() (+24 more)

### Community 10 - "App"
Cohesion: 0.09
Nodes (18): AuthenticatedApp(), AuthenticatedAppProps, AuthStatus, ChangePasswordForm(), ChangePasswordFormProps, ListPageContent, ListPageProps, LockedScreen() (+10 more)

### Community 11 - "Logging"
Cohesion: 0.14
Nodes (15): InitError, init(), InitLoggingError, log_dir(), LogGuard, Display, Error, Formatter (+7 more)

### Community 12 - "Stagecolors"
Cohesion: 0.15
Nodes (13): EXPECTED_HEADERS, FIXED_NOW, ManagerCreate, ManagerEdit, parseStage(), Stage, STAGE_COLORS, STAGE_ORDER (+5 more)

### Community 14 - "SKILL"
Cohesion: 0.12
Nodes (16): 1. Theme System, 2. Styled-Components Conventions, 3. Component Organization, 4. Tauri Backend, 5. TypeScript Standards, Code Reviews, Communication Protocol, Development Commands Reference (+8 more)

### Community 15 - "Leasestatus"
Cohesion: 0.17
Nodes (18): FilterBar(), formatExpiration(), formatSize(), LeaseList(), LeaseListProps, primaryManagerName(), formatNoteText(), Property() (+10 more)

### Community 16 - "Filtergridcontext"
Cohesion: 0.13
Nodes (19): compareOptionalNumbers(), DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, EMPTY_STAGE_COUNTS, FilterGridContext, FilterGridProvider() (+11 more)

### Community 17 - "Package"
Cohesion: 0.11
Nodes (18): scripts, build, build-storybook, dev, format, lint, lint:fix, preview (+10 more)

### Community 18 - "Workbookimportflow"
Cohesion: 0.09
Nodes (28): ALIASES, autoDetectHeaders(), BackendLease, BackendLeaseManager, convertBackendLeasesToUi(), FIELDS, formatExpirationDate(), getFileName() (+20 more)

### Community 19 - "Package"
Cohesion: 0.13
Nodes (15): dompurify, dependencies, dompurify, react, @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, @tauri-apps/plugin-opener, @tiptap/extension-underline (+7 more)

### Community 20 - "Copilot Instructions"
Cohesion: 0.14
Nodes (13): Architecture, Build & Test Commands, Component Organization, Conventions, Copilot Instructions for LeaseBook, Frontend: styled-components + Theme System, Generating Commit Messages, Key Dependencies (+5 more)

### Community 21 - "Propertydetail"
Cohesion: 0.22
Nodes (10): dateToUnix(), DbLeaseResult, EditFields, looksLikePlainText(), normaliseDate(), PropertyDetail(), RtfToolbarProps, unixToIso() (+2 more)

### Community 23 - "Auth Tests"
Cohesion: 0.25
Nodes (14): change_password_requires_current_password_and_replaces_hash(), clearing_data_requires_an_authenticated_session(), create_password_persists_setup_without_storing_plaintext(), disable_password_requires_current_password_and_removes_config(), disabling_passkeys_requires_passkey_when_passkey_is_the_only_factor(), disabling_passkeys_requires_password_then_passkey_when_password_is_enabled(), login_requires_the_created_password_and_logout_clears_session(), mfa_requires_password_then_passkey_when_both_local_methods_are_enabled() (+6 more)

### Community 25 - "Card.stories"
Cohesion: 0.18
Nodes (10): Card(), CardProps, CustomHeight, CustomSize, CustomWidth, Default, MultipleSizes, SpaceBetween (+2 more)

### Community 26 - "Package"
Cohesion: 0.18
Nodes (11): cross-env, eslint, devDependencies, cross-env, eslint, prettier, @storybook/react-vite, @vitest/browser-playwright (+3 more)

### Community 27 - "Default"
Cohesion: 0.18
Nodes (10): core:default, fs:default, main, opener:default, sql:default, description, identifier, permissions (+2 more)

### Community 28 - "Badge.stories"
Cohesion: 0.22
Nodes (8): AllVariants, Emerald, Gray, ProspectBadge, QualifiedBadge, Story, Transparent, WithNumber

### Community 29 - "Searchbar.stories"
Cohesion: 0.22
Nodes (8): SearchBar(), SearchBarProps, CustomPlaceholder, Default, Interactive, Story, WithInteractionTest, WithValue

### Community 30 - "Property"
Cohesion: 0.20
Nodes (9): Lease, LeaseManager, DateTime, Default, LeaseManager, Option, Self, String (+1 more)

### Community 32 - "Tsconfig"
Cohesion: 0.20
Nodes (9): **/*, ../tsconfig.json, compilerOptions, composite, exclude, extends, include, ../graphify-out (+1 more)

### Community 33 - "Gridcontainer"
Cohesion: 0.50
Nodes (4): getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS

### Community 34 - "Dropdown.stories"
Cohesion: 0.29
Nodes (6): Default, ManyItems, SortByDropdown, Story, WithIcons, WithInteractionTest

### Community 35 - "SKILL"
Cohesion: 0.22
Nodes (8): 1. Project Layout & Architecture, 2. React Components & Custom Hooks Strategy, 3. Secure IPC Command Patterns, 4. Idiomatic Rust & Memory Boundaries, 5. Workflow Strategy, Correct React + TypeScript Setup, Correct Rust Backend Command, Tauri v2 + React Development Protocol

### Community 36 - "Tsconfig.node"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 37 - "Propertyform"
Cohesion: 0.16
Nodes (14): PropertyProps, PropertyDetailProps, dateToUnixTimestamp(), DbLease, dbLeaseToFrontend(), FormErrors, PropertyForm(), PropertyFormProps (+6 more)

### Community 40 - "Filtergridcontext.test"
Cohesion: 0.12
Nodes (10): HeaderProps, STAGE_COUNTS_STUB, SearchContext, SearchContextType, SearchProvider(), installLocalStorageStub(), LocalStorageStub, Default (+2 more)

### Community 43 - "Package"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

### Community 44 - "Rustplugin"
Cohesion: 0.47
Nodes (4): Plugin, Project, Config, RustPlugin

### Community 45 - "Mainactivity"
Cohesion: 0.40
Nodes (3): Bundle, MainActivity, TauriActivity

### Community 47 - "Eslint.config"
Cohesion: 0.40
Nodes (4): compat, { FlatCompat }, js, legacy

### Community 48 - "Gradlew"
Cohesion: 0.60
Nodes (3): gradlew script, die(), warn()

### Community 49 - "Sort.stories"
Cohesion: 0.22
Nodes (6): SortDirection, SortProps, Default, InContext, Story, WithInteractionTest

### Community 52 - "Lib"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

## Knowledge Gaps
- **327 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **81 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Package` to `Spreadsheet`, `Package`, `Package`, `@tauri-apps/api`, `Package`, `Package`, `@tiptap/extension-link`, `@tiptap/react`, `Managerdetect`, `Property.stories`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `PropertyDetail()` connect `Propertydetail` to `App`, `Package`, `Leasestatus`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `dompurify` connect `Package` to `Propertydetail`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.11035730438715513 - nodes in this community are weakly interconnected._
- **Should `Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.10367063492063493 - nodes in this community are weakly interconnected._
- **Should `Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.1195134849286092 - nodes in this community are weakly interconnected._