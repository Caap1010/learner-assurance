import { expect, test } from '@playwright/test';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

test('owner approvals category workflow and route progression', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/approvals');
  await expect(page.getByRole('heading', { name: 'Approvals', exact: true })).toBeVisible();

  const uniqueId = Date.now();
  const requestTitle = `Playwright Partner Approval ${uniqueId}`;

  await page.getByRole('button', { name: '+ New Request' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create Approval Request' });
  const submit = dialog.getByRole('button', { name: 'Submit Request' });

  await expect(submit).toBeDisabled();
  await dialog.getByLabel('Category').selectOption('Partner');
  await dialog.getByLabel('Request description').fill(requestTitle);
  await dialog.getByLabel('Linked entity').fill('North Skills Institute');
  await dialog.getByLabel('Requester').fill('Playwright QA');
  await dialog.getByLabel('Priority').selectOption('High');
  await dialog.getByLabel('SLA due (optional)').fill(toDateTimeLocalValue(new Date(Date.now() + 4 * 60 * 60 * 1000)));

  await expect(submit).toBeEnabled();
  await submit.click();

  const requestRow = page.locator('tr', { hasText: requestTitle }).first();
  await expect(requestRow).toBeVisible();
  await expect(requestRow).toContainText('Partner');
  await expect(requestRow).toContainText('North Skills Institute');
  await expect(requestRow).toContainText('Partner Success Lead');

  await page.locator('select.form-input').nth(2).selectOption('Partner');
  await expect(requestRow).toBeVisible();

  await requestRow.getByRole('button', { name: 'Approve Step' }).click();
  await expect(requestRow).toContainText('Compliance Lead');
  await expect(requestRow).toContainText('pending');
});
