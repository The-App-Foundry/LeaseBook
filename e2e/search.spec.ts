import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const leaseRow = (id: number, name: string, address: string) => ({
      id,
      name,
      address,
      size: null,
      expiration_date: null,
      notes: null,
      misc_data: null,
      created_on: 1_700_000_000,
      managers: [],
    });

    window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ || {};
    window.__TAURI_INTERNALS__.invoke = async (cmd: string, args: any) => {
      if (cmd === 'auth_status') {
        return {
          password_enabled: false,
          passkey_enabled: false,
          authenticated: true,
        };
      }

      if (cmd === 'leases_with_managers_paginated') {
        if (args.searchQuery === 'Apple') {
          return {
            leases: [leaseRow(1, 'Apple Store', '1 Infinite Loop')],
            total_count: 1,
          };
        }
        return {
          leases: [
            leaseRow(1, 'Apple Store', '1 Infinite Loop'),
            leaseRow(2, 'Microsoft Store', 'Redmond'),
          ],
          total_count: 2,
        };
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
