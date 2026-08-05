import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // `stage` is a real NOT NULL column, lowercase on the wire.
    // `is_primary` lives on the `leases_managers` join row and is a SQLite
    // INTEGER (0/1), NOT a boolean — the frontend maps it with
    // `m.is_primary === 1`, so `true` would silently read as not-primary.
    const leaseRow = (id: number, name: string, address: string, stage = 'new') => ({
      id,
      name,
      address,
      size: null,
      expiration_date: null,
      notes: null,
      misc_data: null,
      created_on: 1_700_000_000,
      stage,
      managers: [
        {
          id: id * 10,
          name: `Manager ${id}`,
          phone_numbers: '555-0100',
          email: `manager${id}@example.com`,
          is_primary: 1,
        },
      ],
    });

    // `FilterBar` reads `stageCounts.total` unguarded, and the context fetches
    // this command independently of the paginated query. Returning null here
    // crashes the page before any assertion runs.
    const STAGE_COUNTS = {
      total: 2,
      new: 1,
      contacted: 0,
      qualified: 1,
      negotiating: 0,
      won: 0,
      lost: 0,
    };

    window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ || {};
    window.__TAURI_INTERNALS__.invoke = async (cmd: string, args: any) => {
      if (cmd === 'auth_status') {
        return {
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        };
      }

      if (cmd === 'lease_stage_counts') {
        return STAGE_COUNTS;
      }

      if (cmd === 'leases_with_managers_paginated') {
        if (args.searchQuery === 'Apple') {
          return {
            leases: [leaseRow(1, 'Apple Store', '1 Infinite Loop', 'qualified')],
            total_count: 1,
          };
        }
        return {
          leases: [
            leaseRow(1, 'Apple Store', '1 Infinite Loop', 'qualified'),
            leaseRow(2, 'Microsoft Store', 'Redmond', 'new'),
          ],
          total_count: 2,
        };
      }
      if (cmd === 'managers') {
        return [];
      }
      return null;
    };
  });
});

test('search feature filters results correctly', async ({ page }) => {
  await page.goto('/');

  // Wait for initial load
  await expect(page.locator('text=Apple Store')).toBeVisible();
  await expect(page.locator('text=Microsoft Store')).toBeVisible();

  // Type in search bar
  const searchInput = page.locator('input[role="searchbox"]');
  await searchInput.fill('Apple');

  // Microsoft should disappear based on our mock
  await expect(page.locator('text=Microsoft Store')).not.toBeVisible();
  await expect(page.locator('text=Apple Store')).toBeVisible();
});
