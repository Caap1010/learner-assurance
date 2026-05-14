import { expect, test } from '@playwright/test';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

test('owner approvals and compliance smoke flow', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  const uniqueId = Date.now();
  const approvalTitle = `Playwright Smoke Approval ${uniqueId}`;

  await page.goto('/owner/approvals');
  await page.getByRole('button', { name: '+ New Request' }).click();
  await expect(page.getByRole('heading', { name: 'Create Approval Request' })).toBeVisible();

  const approvalSubmit = page.getByRole('button', { name: 'Submit Request' });
  await expect(approvalSubmit).toBeDisabled();

  await page.getByLabel('Linked entity').fill('Executive Dashboard');
  await page.getByLabel('Request description').fill(approvalTitle);
  await page.getByLabel('Requester').fill('Playwright QA');
  await page.getByLabel('SLA due (optional)').fill(toDateTimeLocalValue(new Date(Date.now() + 2 * 60 * 60 * 1000)));

  await expect(approvalSubmit).toBeEnabled();
  await approvalSubmit.click();

  const approvalRow = page.locator('tr', { hasText: approvalTitle });
  await expect(approvalRow).toBeVisible();
  await approvalRow.getByRole('button', { name: 'Reject' }).click();
  await page.getByRole('combobox').first().selectOption('all');
  await expect(approvalRow).toContainText('rejected');
  await expect(approvalRow.getByRole('button', { name: 'Approve Step' })).toBeDisabled();

  const scheduleName = `Playwright Compliance Pack ${uniqueId}`;

  await page.goto('/owner/compliance');
  await page.getByRole('button', { name: '+ New Schedule' }).click();
  await expect(page.getByRole('heading', { name: 'Create Report Schedule' })).toBeVisible();

  const saveSchedule = page.getByRole('button', { name: 'Save Schedule' });
  await expect(saveSchedule).toBeDisabled();

  await page.getByLabel('Schedule name').fill(scheduleName);
  await page.getByLabel('Audience').fill('Owner QA Team');
  await page.getByLabel('Next run').fill(toDateTimeLocalValue(new Date(Date.now() + 3 * 60 * 60 * 1000)));

  await expect(saveSchedule).toBeEnabled();
  await saveSchedule.click();

  const scheduleRows = page.locator('tr', { hasText: scheduleName });
  await expect(scheduleRows).toHaveCount(1);
  const scheduleRow = scheduleRows.first();

  await scheduleRow.getByRole('button', { name: 'Pause' }).click();
  await expect(scheduleRow).toContainText('paused');
  await expect(scheduleRows).toHaveCount(1);

  await scheduleRow.getByRole('button', { name: 'Resume' }).click();
  await expect(scheduleRow).toContainText('active');
  await expect(scheduleRows).toHaveCount(1);

  await page.goto('/owner/audit-log');
  await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
  await page.getByPlaceholder('Search action, target, details').fill(approvalTitle);
  await expect(page.locator('tr', { hasText: approvalTitle }).first()).toBeVisible();
});
