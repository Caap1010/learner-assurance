import { expect, test } from '@playwright/test';

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

test('owner document vault validation and create flow', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/compliance');
  await page.getByRole('button', { name: '+ Add Document' }).click();
  await expect(page.getByRole('heading', { name: 'Add Vault Document' })).toBeVisible();

  const submit = page.getByRole('button', { name: 'Add Document', exact: true });
  await expect(submit).toBeDisabled();

  const uniqueId = Date.now();
  const title = `Playwright Vault Doc ${uniqueId}`;

  await page.getByLabel('Document title').fill(title);
  await page.getByLabel('Owner').fill('QA Owner');
  await page.getByLabel('Linked entity').fill('QA Institute');

  const pastDate = toDateValue(new Date(Date.now() - 24 * 60 * 60 * 1000));
  await page.getByLabel('Expiry date').fill(pastDate);
  await expect(submit).toBeDisabled();

  const futureDate = toDateValue(new Date(Date.now() + 40 * 24 * 60 * 60 * 1000));
  await page.getByLabel('Expiry date').fill(futureDate);
  await expect(submit).toBeEnabled();
  await submit.click();

  const docRow = page.locator('tr', { hasText: title });
  await expect(docRow).toHaveCount(1);
  await expect(docRow).toContainText('active');
});
