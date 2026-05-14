import { expect, test } from '@playwright/test';

test('owner integrations create sync retry and edit workflow', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/integrations');
  await expect(page.getByRole('heading', { name: 'Integrations', exact: true })).toBeVisible();

  const uniqueId = Date.now();
  const connectorName = `Playwright Connector ${uniqueId}`;

  await page.getByRole('button', { name: '+ Add Integration' }).click();
  const dialog = page.getByRole('dialog', { name: 'Add Integration' });
  await expect(dialog.getByRole('heading', { name: 'Add Integration' })).toBeVisible();

  await dialog.getByLabel('Name').fill(connectorName);
  await dialog.getByLabel('Provider').fill('Azure DevOps');
  await dialog.getByLabel('Endpoint').fill('azure/devops/api');
  await dialog.getByLabel('Owner').fill('Platform Owner');
  await dialog.getByLabel('Retry policy').fill('2 attempts with 5m backoff');
  await dialog.getByLabel('Notes').fill('Learner evidence and sync status pipeline.');
  await dialog.getByRole('button', { name: 'Create Integration' }).click();

  const row = page.locator('tr', { hasText: connectorName }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('Azure DevOps');

  await row.getByRole('button', { name: 'Sync' }).click();
  await expect(row).toContainText('Connected');

  await row.getByRole('button', { name: 'Retry' }).click();
  await expect(row).toContainText('Syncing');

  await row.getByRole('button', { name: 'Configure' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Configure Integration' });
  await expect(editDialog.getByRole('heading', { name: 'Configure Integration' })).toBeVisible();

  await editDialog.getByLabel('Retry policy').fill('4 attempts with 10m backoff');
  await editDialog.getByLabel('Notes').fill('Updated retry policy after token refresh issues.');
  await editDialog.getByRole('button', { name: 'Save Integration' }).click();

  await expect(page.locator('tr', { hasText: connectorName }).first()).toContainText('4 attempts with 10m backoff');
  await page.getByPlaceholder('Search connector, provider, owner, or endpoint').fill(connectorName);
  await expect(page.locator('tr', { hasText: connectorName }).first()).toBeVisible();
});
