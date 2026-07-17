import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let leases = [];
    let nextId = 1;
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {
        invoke: async (cmd: string, args: any) => {
          if (cmd === 'leases_with_managers_paginated') {
            return {
              leases,
              total_count: leases.length
            };
          }
          if (cmd === 'new_lease') {
            const lease = {
              id: nextId++,
              name: args.name,
              address: args.address,
              expiration_date: args.expirationDate,
              managers: []
            };
            leases.push(lease);
            return lease;
          }
          if (cmd === 'remove_lease') {
            leases = leases.filter(l => l.id !== args.leaseId);
            return 1;
          }
          return null;
        }
      }
    });
  });
});

test('can create and delete a lease', async ({ page }) => {
  await page.goto('/');

  // Should see empty state
  await expect(page.locator('text=No leases yet')).toBeVisible();

  // Click create
  await page.click('button:has-text("Create New Lease")');

  // Fill form
  await page.fill('#f-name', 'New Test Property');
  await page.fill('#f-address', '123 Fake St');
  await page.click('button[type="submit"]');

  // Verify it appears in the list
  await expect(page.locator('text=New Test Property')).toBeVisible();

  // Click to delete
  // The GridContainer probably has a row or card we can click, let's just find the property and click it to open details
  await page.click('text=New Test Property');
  
  // Assuming there is a delete button in detail view
  // Wait for detail view
  await expect(page.locator('text=Delete')).toBeVisible();
  
  // Click delete
  page.on('dialog', dialog => dialog.accept());
  await page.click('text=Delete');
  
  // Should be back to empty state
  await expect(page.locator('text=No leases yet')).toBeVisible();
});
