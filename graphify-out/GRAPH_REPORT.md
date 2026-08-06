# Graph Report - LeaseBook  (2026-08-06)

## Corpus Check
- 115 files · ~80,826 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1007 nodes · 1989 edges · 125 communities (65 shown, 60 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 118 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `daa59bff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppError
- commands.rs
- operations.rs
- map_spreadsheet_to_leases
- parse_spreadsheet_from_path
- WorkbookImportFlow.tsx
- lease.ts
- passkey_browser.rs
- App.tsx
- compilerOptions
- tauri.conf.json
- GridContainer.stories.tsx
- models.rs
- GridContainer.tsx
- logging.rs
- scripts
- LeaseList.tsx
- FilterGridContext.tsx
- auth_tests.rs
- iOS Application Icon Assets
- 2026-03-29-000000-0002_fix_lease_schema/down.sql
- dependencies
- 2026-03-29-000000-0002_fix_lease_schema/up.sql
- Card.stories.tsx
- Property.stories.tsx
- devDependencies
- default.json
- SearchBar.stories.tsx
- Lease
- .storybook/tsconfig.json
- Dropdown.stories.tsx
- compilerOptions
- Sort.stories.tsx
- ui/index.ts
- package.json
- PropertyDetail.tsx
- eslint.config.cjs
- CLAUDE.md
- establish_pool
- 2026-04-03-144001-0000_add_size_column/down.sql
- 2026-04-03-144001-0000_add_size_column/up.sql
- HelloWorld.tsx
- 2026-03-15-190245-0000_create_lease/up.sql
- 2026-03-15-203209-0000_add_created_on_col/down.sql
- eslint
- eslint-config-prettier
- @eslint/eslintrc
- eslint-import-resolver-typescript
- eslint-plugin-import
- eslint-plugin-jsx-a11y
- eslint-plugin-prettier
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-storybook
- @fontsource/inter
- jsdom
- lucide-react
- bootstrap
- react-bootstrap
- react-dom
- @tiptap/pm
- @tiptap/react
- @tauri-apps/plugin-opener
- playwright
- @playwright/test
- storybook
- @storybook/addon-a11y
- @storybook/addon-docs
- @storybook/addon-vitest
- @tauri-apps/cli
- @testing-library/jest-dom
- @testing-library/react
- @testing-library/user-event
- @types/dompurify
- @types/react
- typescript
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- vite
- @vitejs/plugin-react
- vitest
- vitest-browser-react
- @vitest/coverage-v8
- main.ts
- LeaseBook Fullstack Engineer Skill
- Tauri Rust Pro Skill
- Lead Engineer Agent
- CI Workflow
- Claude Code Review Workflow
- Claude Code Workflow
- CodeQL Advanced Workflow
- Release Workflow
- Tauri Logo
- Vite Logo
- LeaseBook Logo (Mobile)
- React Logo
- Storybook Preview Head
- @tiptap/extension-link
- @types/react-dom
- lease_managers
- leases_managers
- leases_managers

## God Nodes (most connected - your core abstractions)
1. `AppError` - 57 edges
2. `AuthManager` - 55 edges
3. `map_spreadsheet_to_leases()` - 25 edges
4. `setup_db()` - 22 edges
5. `scripts` - 19 edges
6. `parse_spreadsheet_from_path()` - 19 edges
7. `Lease` - 19 edges
8. `seed_stage()` - 18 edges
9. `create_lease()` - 17 edges
10. `test_auth_path()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `manyLeases()` --calls--> `createLease()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `withGrid()` --calls--> `createFilterGridValue()`  [EXTRACTED]
  .storybook/stories/layout/GridContainer.stories.tsx → src/test/filterGridValue.ts
- `PropertyDetail()` --references--> `dompurify`  [EXTRACTED]
  src/components/layout/PropertyDetail.tsx → package.json
- `clear_all_data()` --calls--> `clear_all_records()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/db/operations.rs
- `parse_spreadsheet()` --calls--> `parse_spreadsheet_from_path()`  [INFERRED]
  src-tauri/src/commands.rs → src-tauri/src/parser.rs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD and Automation Pipeline** — github_workflows_ci_yml, github_workflows_claude_code_review_yml, github_workflows_claude_yml, github_workflows_codeql_yml, github_workflows_release_yml [EXTRACTED 1.00]
- **AI Agent Guidance and Skills** — agents_md, claude_md, agents_skills_leasebook_engineer_skill, agents_skills_tauri_rust_pro_skill, github_copilot_instructions, github_agents_lead_engineer_agent [EXTRACTED 1.00]
- **iOS Icon Asset Set** — src_tauri_icons_ios_appicon_20x20_3x, src_tauri_icons_ios_appicon_29x29_1x, src_tauri_icons_ios_appicon_29x29_2x_1, src_tauri_icons_ios_appicon_29x29_2x, src_tauri_icons_ios_appicon_29x29_3x, src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_appicon_512_2x, src_tauri_icons_ios_appicon_60x60_2x, src_tauri_icons_ios_appicon_60x60_3x, src_tauri_icons_ios_appicon_76x76_1x, src_tauri_icons_ios_appicon_76x76_2x, src_tauri_icons_ios_appicon_83_5x83_5_2x [EXTRACTED 1.00]

## Communities (125 total, 60 thin omitted)

### Community 0 - "AppError"
Cohesion: 0.08
Nodes (43): DieselError, Into, Mutex, Passkey, PasskeyAuthentication, PasskeyRegistration, auth_error(), auth_file_path() (+35 more)

### Community 1 - "commands.rs"
Cohesion: 0.10
Nodes (63): AppHandle, CommandResult, DbLease, auth_login(), auth_logout(), auth_status(), browser_passkey_login(), browser_passkey_registration() (+55 more)

### Community 2 - "operations.rs"
Cohesion: 0.12
Nodes (60): clear_all_records(), count_leases(), create_lease(), create_manager(), current_unix_timestamp(), delete_lease(), delete_manager(), get_all_leases_with_managers() (+52 more)

### Community 3 - "map_spreadsheet_to_leases"
Cohesion: 0.09
Nodes (51): HashSet, NaiveDate, NaiveDateTime, Self, cell_to_string(), collect_misc_data(), map_sheet_to_leases(), map_spreadsheet_to_leases() (+43 more)

### Community 4 - "parse_spreadsheet_from_path"
Cohesion: 0.14
Nodes (31): AsRef, Data, Range, Sheets, cell_is_empty(), cell_to_header(), convert_cell(), detect_header_row_index() (+23 more)

### Community 5 - "WorkbookImportFlow.tsx"
Cohesion: 0.09
Nodes (28): ALIASES, autoDetectHeaders(), BackendLease, BackendLeaseManager, convertBackendLeasesToUi(), FIELDS, formatExpirationDate(), getFileName() (+20 more)

### Community 6 - "lease.ts"
Cohesion: 0.11
Nodes (28): FilterBar(), formatNoteText(), Property(), PropertyProps, stripHtml(), useClampedNote(), dateToUnixTimestamp(), DbLease (+20 more)

### Community 7 - "passkey_browser.rs"
Cohesion: 0.17
Nodes (25): Drop, FnOnce, ceremony_page(), CeremonyMode, CeremonyResult, CleanupGuard, completion_page(), content_length() (+17 more)

### Community 8 - "App.tsx"
Cohesion: 0.09
Nodes (20): App(), AuthenticatedApp(), AuthenticatedAppProps, AuthStatus, ChangePasswordForm(), ChangePasswordFormProps, ListPageContent, ListPageProps (+12 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2021, .storybook/**/*.ts, .storybook/**/*.tsx, compilerOptions, allowImportingTsExtensions, isolatedModules (+18 more)

### Community 10 - "tauri.conf.json"
Cohesion: 0.07
Nodes (27): $HOME/.local/share/com.openworld.leasebook/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, security (+19 more)

### Community 11 - "GridContainer.stories.tsx"
Cohesion: 0.10
Nodes (24): EXPECTED_HEADERS, FIXED_NOW, renderList(), renderToggle(), FilterGridContext, ViewMode, BASE_FILTER_GRID_VALUE, createFilterGridValue() (+16 more)

### Community 12 - "models.rs"
Cohesion: 0.14
Nodes (20): Err, FromStr, Lease, LeaseManager, LeasesManagers, NewLease, NewManager, ParseStageError (+12 more)

### Community 13 - "GridContainer.tsx"
Cohesion: 0.18
Nodes (9): getPageNumbers(), GridContainer(), GridContainerProps, PAGE_SIZE_OPTIONS, Header(), HeaderProps, Default, Story (+1 more)

### Community 14 - "logging.rs"
Cohesion: 0.14
Nodes (15): InitError, init(), InitLoggingError, log_dir(), LogGuard, Display, Error, Formatter (+7 more)

### Community 15 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, build-storybook, dev, format, lint, lint:fix, preview (+11 more)

### Community 16 - "LeaseList.tsx"
Cohesion: 0.21
Nodes (13): formatExpiration(), formatSize(), LeaseList(), LeaseListProps, primaryManagerName(), daysUntil(), ExpirationMeta, ExpirationRule (+5 more)

### Community 17 - "FilterGridContext.tsx"
Cohesion: 0.09
Nodes (26): compareOptionalNumbers(), DbLease, dbLeaseToUi(), DbLeaseWithManagers, DbManager, EMPTY_STAGE_COUNTS, FilterGridProvider(), getLeaseExpirationTime() (+18 more)

### Community 18 - "auth_tests.rs"
Cohesion: 0.22
Nodes (16): change_password_requires_current_password_and_replaces_hash(), clearing_data_requires_an_authenticated_session(), create_password_persists_setup_without_storing_plaintext(), disable_password_requires_current_password_and_removes_config(), disabling_passkeys_requires_password_even_when_passkey_is_the_only_factor(), disabling_passkeys_requires_password_then_passkey_when_password_is_enabled(), disabling_password_is_rejected_while_passkeys_are_enabled(), login_requires_the_created_password_and_logout_clears_session() (+8 more)

### Community 19 - "iOS Application Icon Assets"
Cohesion: 0.12
Nodes (16): iOS Application Icon Assets, App Icon 20x20@3x, App Icon 29x29@1x, App Icon 29x29@2x, App Icon 29x29@2x-1, App Icon 29x29@3x, App Icon 40x40@1x, App Icon 40x40@2x (+8 more)

### Community 20 - "2026-03-29-000000-0002_fix_lease_schema/down.sql"
Cohesion: 0.33
Nodes (5): lease_managers_new, leases_managers, leases_managers_bak, leases_new, lease_managers

### Community 21 - "dependencies"
Cohesion: 0.13
Nodes (15): dompurify, dependencies, dompurify, react, @tauri-apps/api, @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, @tiptap/extension-underline (+7 more)

### Community 22 - "2026-03-29-000000-0002_fix_lease_schema/up.sql"
Cohesion: 0.33
Nodes (5): lease_managers_new, leases_managers, leases_managers_bak, leases_new, lease_managers

### Community 23 - "Card.stories.tsx"
Cohesion: 0.18
Nodes (10): Card(), CardProps, CustomHeight, CustomSize, CustomWidth, Default, MultipleSizes, SpaceBetween (+2 more)

### Community 24 - "Property.stories.tsx"
Cohesion: 0.17
Nodes (11): Default, defaultData, Lost, MOCK_LEASES, MultipleProperties, Negotiating, NoExpirationOnRecord, Qualified (+3 more)

### Community 25 - "devDependencies"
Cohesion: 0.18
Nodes (11): @chromatic-com/storybook, cross-env, devDependencies, @chromatic-com/storybook, cross-env, prettier, @storybook/react-vite, @vitest/browser-playwright (+3 more)

### Community 26 - "default.json"
Cohesion: 0.18
Nodes (10): core:default, fs:default, main, opener:default, sql:default, description, identifier, permissions (+2 more)

### Community 27 - "SearchBar.stories.tsx"
Cohesion: 0.22
Nodes (8): SearchBar(), SearchBarProps, CustomPlaceholder, Default, Interactive, Story, WithInteractionTest, WithValue

### Community 28 - "Lease"
Cohesion: 0.20
Nodes (9): Lease, LeaseManager, DateTime, Default, LeaseManager, Option, Self, String (+1 more)

### Community 29 - ".storybook/tsconfig.json"
Cohesion: 0.20
Nodes (9): **/*, ../tsconfig.json, compilerOptions, composite, exclude, extends, include, ../graphify-out (+1 more)

### Community 30 - "Dropdown.stories.tsx"
Cohesion: 0.22
Nodes (8): Dropdown(), DropdownMenuProps, Default, ManyItems, SortByDropdown, Story, WithIcons, WithInteractionTest

### Community 31 - "compilerOptions"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 32 - "Sort.stories.tsx"
Cohesion: 0.25
Nodes (7): Sort(), SortDirection, SortProps, Default, InContext, Story, WithInteractionTest

### Community 33 - "ui/index.ts"
Cohesion: 0.18
Nodes (9): Badge(), AllVariants, Emerald, Gray, ProspectBadge, QualifiedBadge, Story, Transparent (+1 more)

### Community 34 - "package.json"
Cohesion: 0.33
Nodes (5): name, packageManager, private, type, version

### Community 35 - "PropertyDetail.tsx"
Cohesion: 0.20
Nodes (11): dateToUnix(), DbLeaseResult, EditFields, looksLikePlainText(), normaliseDate(), PropertyDetail(), PropertyDetailProps, RtfToolbarProps (+3 more)

### Community 36 - "eslint.config.cjs"
Cohesion: 0.40
Nodes (4): compat, { FlatCompat }, js, legacy

### Community 39 - "establish_pool"
Cohesion: 0.67
Nodes (3): establish_pool(), DbPool, run()

### Community 40 - "2026-04-03-144001-0000_add_size_column/down.sql"
Cohesion: 0.40
Nodes (4): leases_managers, leases_managers_bak, leases_new, lease_managers

### Community 41 - "2026-04-03-144001-0000_add_size_column/up.sql"
Cohesion: 0.40
Nodes (4): leases_managers, leases_managers_bak, leases_new, lease_managers

### Community 43 - "2026-03-15-190245-0000_create_lease/up.sql"
Cohesion: 0.83
Nodes (3): lease_managers, leases, leases_managers

### Community 44 - "2026-03-15-203209-0000_add_created_on_col/down.sql"
Cohesion: 0.83
Nodes (3): lease_managers, leases, leases_managers

## Knowledge Gaps
- **301 isolated node(s):** `config`, `preview`, `Story`, `Default`, `WithPadding` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `@tiptap/extension-link`, `@fontsource/inter`, `lucide-react`, `bootstrap`, `react-bootstrap`, `react-dom`, `@tiptap/pm`, `@tiptap/react`, `@tauri-apps/plugin-opener`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `PropertyDetail()` connect `PropertyDetail.tsx` to `App.tsx`, `LeaseList.tsx`, `dependencies`, `lease.ts`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `dompurify` connect `dependencies` to `PropertyDetail.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `config`, `preview`, `Story` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppError` be split into smaller, more focused modules?**
  _Cohesion score 0.07927170868347339 - nodes in this community are weakly interconnected._
- **Should `commands.rs` be split into smaller, more focused modules?**
  _Cohesion score 0.10367063492063493 - nodes in this community are weakly interconnected._
- **Should `operations.rs` be split into smaller, more focused modules?**
  _Cohesion score 0.1195134849286092 - nodes in this community are weakly interconnected._