---
name: Bootstrap Migration Complete
description: App was migrated from styled-components to Bootstrap 5 + react-bootstrap in April 2026
type: project
---

App was fully migrated from styled-components to Bootstrap 5 + react-bootstrap.

**Why:** User requested Bootstrap instead of styled-components for faster UI development flow.

**How to apply:** All new components should use Bootstrap classes and the `lb-*` CSS custom classes from `src/App.css`. Do not reintroduce styled-components.

Key decisions made:
- All custom styles live in `src/App.css` with `lb-` prefix (e.g. `lb-btn`, `lb-card`, `lb-property-card`)
- Bootstrap CSS imported once in `main.tsx` (`bootstrap/dist/css/bootstrap.min.css`)
- `react-bootstrap` `Modal` replaces custom Modal (handles backdrop, Escape, scroll-lock)
- `Button`, `Badge`, `Card` are now plain React functional components using className props
- `$variant` prop on Button still works; maps to `lb-btn-*` CSS classes
- `$width` / `$height` on Card still work; applied via inline `style` prop
- styled-components and @types/styled-components were removed from package.json
- `src/styles/theme.ts`, `styled.d.ts`, `global.ts` were deleted
- Pre-existing lint errors in vitest/vite config files are unrelated — ignore them
- Pre-existing type bug fixed: `WorkbookImportFlow` had `size: '-'` (string) on a `Lease.size?: number` field — removed the field
