# Graph Report - .  (2026-07-28)

## Corpus Check
- 70 files · ~97,609 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1049 nodes · 1932 edges · 157 communities (72 shown, 85 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 89 edges (avg confidence: 0.77)
- Token cost: 6,609 input · 1,589 output

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
- Viewtoggle.test
- Searchcontext
- Package
- Rustplugin
- Mainactivity
- Buildtask
- Eslint.config
- Gradlew
- Sort.stories
- Tabbar
- Lib
- Modal
- Preview
- Helloworld
- Package
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
- Community 148
- Community 150

## God Nodes (most connected - your core abstractions)
1. `AppError` - 56 edges
2. `AuthManager` - 53 edges
3. `map_spreadsheet_to_leases()` - 24 edges
4. `setup_db()` - 21 edges
5. `parse_spreadsheet_from_path()` - 19 edges
6. `Lease` - 19 edges
7. `create_lease()` - 17 edges
8. `seed_stage()` - 17 edges
9. `scripts` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `manyLeases()` --calls--> `createLease()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `withGrid()` --calls--> `createFilterGridValue()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `AuthConfig` --implements--> `Default`  [EXTRACTED]
  src-tauri/src/auth.rs → .storybook/stories/layout/Property.stories.tsx
- `PropertyDetail()` --references--> `dompurify`  [EXTRACTED]
  src/components/layout/PropertyDetail.tsx → package.json
- `Release Workflow` --references--> `LeaseBook Project`  [INFERRED]
  .github/workflows/release.yml → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **LeaseBook Branding Assets** — src_tauri_icons_64x64, src_tauri_icons_square107x107logo, src_tauri_icons_square142x142logo, src_tauri_icons_square150x150logo, src_tauri_icons_square284x284logo, src_tauri_icons_square30x30logo, src_tauri_icons_square310x310logo, src_tauri_icons_square44x44logo, src_tauri_icons_square71x71logo, src_tauri_icons_square89x89logo, src_tauri_icons_storelogo, src_tauri_icons_icon, src_tauri_icons_ios_appicon_20x20_1x, src_tauri_icons_ios_appicon_20x20_2x_1, src_tauri_icons_ios_appicon_20x20_2x, src_tauri_icons_ios_appicon_20x20_3x, src_tauri_icons_ios_appicon_29x29_1x, src_tauri_icons_ios_appicon_29x29_2x_1, src_tauri_icons_ios_appicon_29x29_2x, src_tauri_icons_ios_appicon_29x29_3x [EXTRACTED 1.00]
- **LeaseBook iOS App Icons** — src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_appicon_512_2x, src_tauri_icons_ios_appicon_60x60_2x, src_tauri_icons_ios_appicon_60x60_3x, src_tauri_icons_ios_appicon_76x76_1x, src_tauri_icons_ios_appicon_76x76_2x, src_tauri_icons_ios_appicon_83_5x83_5_2x [EXTRACTED 1.00]

## Communities (157 total, 85 thin omitted)

### Community 0 - "Auth"
Cohesion: 0.08
Nodes (40): DieselError, Into, Mutex, Passkey, PasskeyAuthentication, PasskeyRegistration, auth_error(), auth_file_path() (+32 more)

### Community 1 - "Commands"
Cohesion: 0.09
Nodes (66): AppHandle, CommandResult, DbLease, auth_login(), auth_logout(), auth_status(), browser_passkey_login(), browser_passkey_registration() (+58 more)

### Community 2 - "Operations"
Cohesion: 0.12
Nodes (58): count_leases(), create_lease(), create_manager(), current_unix_timestamp(), delete_lease(), delete_manager(), get_all_leases_with_managers(), get_last_manager_id() (+50 more)

### Community 3 - "Prop Map"
Cohesion: 0.11
Nodes (44): HashSet, NaiveDate, Sheet, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases(), normalize_key() (+36 more)

### Community 4 - "Parser Tests"
Cohesion: 0.13
Nodes (33): AsRef, Data, Range, Sheets, cell_is_empty(), cell_to_header(), convert_cell(), detect_header_row_index() (+25 more)

### Community 5 - "Passkey Browser"
Cohesion: 0.17
Nodes (25): Drop, FnOnce, ceremony_page(), CeremonyMode, CeremonyResult, CleanupGuard, completion_page(), content_length() (+17 more)

### Community 6 - "Tsconfig"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2021, .storybook/**/*.ts, .storybook/**/*.tsx, compilerOptions, allowImportingTsExtensions, isolatedModules (+18 more)

### Community 7 - "Tauri.conf"
Cohesion: 0.07
Nodes (26): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.ico, app, security, windows (+18 more)

### Community 8 - "Models"
Cohesion: 0.14
Nodes (20): Err, FromStr, Lease, LeaseManager, LeasesManagers, NewLease, NewManager, ParseStageError (+12 more)

### Community 9 - "Gridcontainer.stories"
Cohesion: 0.12
Nodes (21): EXPECTED_HEADERS, FIXED_NOW, renderList(), renderToggle(), BASE_FILTER_GRID_VALUE, createFilterGridValue(), createLease(), createManager() (+13 more)

### Community 10 - "App"
Cohesion: 0.11
Nodes (16): AuthenticatedApp(), AuthenticatedAppProps, AuthStatus, ChangePasswordForm(), ChangePasswordFormProps, ListPageContent, ListPageProps, LockedScreen() (+8 more)

### Community 11 - "Logging"
Cohesion: 0.14
Nodes (15): InitError, init(), InitLoggingError, log_dir(), LogGuard, Display, Error, Formatter (+7 more)

### Community 12 - "Stagecolors"
Cohesion: 0.16
Nodes (14): FilterBar(), formatNoteText(), Property(), stripHtml(), useClampedNote(), SortOption, parseStage(), STAGE_COLORS (+6 more)

### Community 13 - "Leasebook Fullstack Engineer"
Cohesion: 0.11
Nodes (17): 1. Theme System, 2. Styled-Components Conventions, 3. Component Organization, 4. Tauri Backend, 5. TypeScript Standards, Code Reviews, Communication Protocol, Development Commands Reference (+9 more)

### Community 14 - "SKILL"
Cohesion: 0.12
Nodes (16): 1. Theme System, 2. Styled-Components Conventions, 3. Component Organization, 4. Tauri Backend, 5. TypeScript Standards, Code Reviews, Communication Protocol, Development Commands Reference (+8 more)

### Community 15 - "Leasestatus"
Cohesion: 0.20
Nodes (14): formatExpiration(), formatSize(), LeaseList(), LeaseListProps, primaryManagerName(), daysUntil(), ExpirationMeta, ExpirationRule (+6 more)

### Community 16 - "Filtergridcontext"
Cohesion: 0.18
Nodes (16): compareOptionalNumbers(), DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, EMPTY_STAGE_COUNTS, FilterGridProvider(), getLeaseExpirationTime() (+8 more)

### Community 17 - "Package"
Cohesion: 0.12
Nodes (16): scripts, build, build-storybook, dev, format, lint, lint:fix, preview (+8 more)

### Community 18 - "Workbookimportflow"
Cohesion: 0.19
Nodes (14): ALIASES, autoDetectHeaders(), BackendLease, BackendLeaseManager, convertBackendLeasesToUi(), FIELDS, formatExpirationDate(), getFileName() (+6 more)

### Community 19 - "Package"
Cohesion: 0.15
Nodes (14): dompurify, dependencies, dompurify, react-dom, @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, @tauri-apps/plugin-opener, @tiptap/extension-link (+6 more)

### Community 20 - "Copilot Instructions"
Cohesion: 0.14
Nodes (13): Architecture, Build & Test Commands, Component Organization, Conventions, Copilot Instructions for LeaseBook, Frontend: styled-components + Theme System, Generating Commit Messages, Key Dependencies (+5 more)

### Community 21 - "Propertydetail"
Cohesion: 0.23
Nodes (12): dateToUnix(), DbLeaseResult, EditFields, looksLikePlainText(), normaliseDate(), PropertyDetail(), PropertyDetailProps, RtfToolbarProps (+4 more)

### Community 22 - "Button.stories"
Cohesion: 0.16
Nodes (11): Button(), ButtonProps, variantClass, AllVariants, Default, Destructive, FilterButton, Ghost (+3 more)

### Community 23 - "Auth Tests"
Cohesion: 0.26
Nodes (13): change_password_requires_current_password_and_replaces_hash(), create_password_persists_setup_without_storing_plaintext(), disable_password_requires_current_password_and_removes_config(), disabling_passkeys_requires_passkey_when_passkey_is_the_only_factor(), disabling_passkeys_requires_password_then_passkey_when_password_is_enabled(), login_requires_the_created_password_and_logout_clears_session(), mfa_requires_password_then_passkey_when_both_local_methods_are_enabled(), passkey_login_requires_a_registered_passkey() (+5 more)

### Community 24 - "Managerdetect"
Cohesion: 0.23
Nodes (9): PropertyProps, Manager, ManagerCreate, ManagerEdit, DetectionResult, detectManagers(), parseEntry(), splitEntries() (+1 more)

### Community 25 - "Card.stories"
Cohesion: 0.18
Nodes (10): Card(), CardProps, CustomHeight, CustomSize, CustomWidth, Default, MultipleSizes, SpaceBetween (+2 more)

### Community 26 - "Package"
Cohesion: 0.18
Nodes (11): cross-env, devDependencies, cross-env, @playwright/test, prettier, @storybook/react-vite, @vitest/browser-playwright, @playwright/test (+3 more)

### Community 27 - "Default"
Cohesion: 0.18
Nodes (10): core:default, fs:default, main, opener:default, sql:default, description, identifier, permissions (+2 more)

### Community 28 - "Badge.stories"
Cohesion: 0.20
Nodes (9): Badge(), AllVariants, Emerald, Gray, ProspectBadge, QualifiedBadge, Story, Transparent (+1 more)

### Community 29 - "Searchbar.stories"
Cohesion: 0.22
Nodes (8): SearchBar(), SearchBarProps, CustomPlaceholder, Default, Interactive, Story, WithInteractionTest, WithValue

### Community 30 - "Property"
Cohesion: 0.20
Nodes (9): Lease, LeaseManager, DateTime, LeaseManager, Option, Self, String, Utc (+1 more)

### Community 31 - "Property.stories"
Cohesion: 0.18
Nodes (10): defaultData, Lost, MOCK_LEASES, MultipleProperties, Negotiating, NoExpirationOnRecord, Qualified, Renewed (+2 more)

### Community 32 - "Tsconfig"
Cohesion: 0.20
Nodes (9): **/*, ../tsconfig.json, compilerOptions, composite, exclude, extends, include, ../graphify-out (+1 more)

### Community 33 - "Gridcontainer"
Cohesion: 0.22
Nodes (6): getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS, SortDirection, SortProps

### Community 34 - "Dropdown.stories"
Cohesion: 0.20
Nodes (7): DropdownMenuProps, Default, ManyItems, SortByDropdown, Story, WithIcons, WithInteractionTest

### Community 35 - "SKILL"
Cohesion: 0.22
Nodes (8): 1. Project Layout & Architecture, 2. React Components & Custom Hooks Strategy, 3. Secure IPC Command Patterns, 4. Idiomatic Rust & Memory Boundaries, 5. Workflow Strategy, Correct React + TypeScript Setup, Correct Rust Backend Command, Tauri v2 + React Development Protocol

### Community 36 - "Tsconfig.node"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 37 - "Propertyform"
Cohesion: 0.31
Nodes (8): dateToUnixTimestamp(), DbLease, dbLeaseToFrontend(), FormErrors, PropertyForm(), PropertyFormProps, unixTimestampToIso(), STAGE_ORDER

### Community 38 - "Spreadsheet"
Cohesion: 0.46
Nodes (7): NaiveDateTime, Cell, Row, String, Vec, Sheet, Spreadsheet

### Community 39 - "Header.stories"
Cohesion: 0.25
Nodes (4): HeaderProps, Default, Story, WithContent

### Community 40 - "Filtergridcontext.test"
Cohesion: 0.32
Nodes (3): STAGE_COUNTS_STUB, installLocalStorageStub(), LocalStorageStub

### Community 42 - "Searchcontext"
Cohesion: 0.38
Nodes (3): SearchContext, SearchContextType, SearchProvider()

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
Cohesion: 0.40
Nodes (4): Default, InContext, Story, WithInteractionTest

### Community 52 - "Lib"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

## Knowledge Gaps
- **336 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **85 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Default` connect `Property` to `Auth`, `Property.stories`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `AuthConfig` connect `Auth` to `Property`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package` to `Package`, `Package`, `Package`, `Package`, `Package`, `Package`, `Package`, `Package`, `Package`, `Package`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _336 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.08395061728395062 - nodes in this community are weakly interconnected._
- **Should `Commands` be split into smaller, more focused modules?**
  _Cohesion score 0.09218612818261633 - nodes in this community are weakly interconnected._
- **Should `Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.12259887005649718 - nodes in this community are weakly interconnected._