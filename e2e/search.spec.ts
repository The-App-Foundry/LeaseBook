import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__TAURI_INTERNALS__ = window.__TAURI_INTERNALS__ || {};
    window.__TAURI_INTERNALS__.invoke = async (cmd: string, args: any) => {
      if (cmd === 'leases_with_managers_paginated') {
        if (args.searchQuery === 'Apple') {
          return {
            leases: [
              { lease: { id: 1, name: 'Apple Store', address: '1 Infinite Loop', expiration_date: null, managers: [] }, managers: [] }
            ],
            total_count: 1
          };
        }
        return {
          leases: [
            { lease: { id: 1, name: 'Apple Store', address: '1 Infinite Loop', expiration_date: null, managers: [] }, managers: [] },
            { lease: { id: 2, name: 'Microsoft Store', address: 'Redmond', expiration_date: null, managers: [] }, managers: [] }
          ],
          total_count: 2
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
