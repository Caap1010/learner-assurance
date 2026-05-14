import { expect, test } from '@playwright/test';

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

test('owner interventions workflow create and status update', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/interventions');
  await expect(page.getByRole('heading', { name: 'Interventions', exact: true })).toBeVisible();
  const casesCard = page.getByRole('heading', { name: 'Platform Risk Cases' }).locator('..').locator('..');

  const uniqueId = Date.now();
  const learnerName = `Playwright Learner ${uniqueId}`;

  await page.getByRole('button', { name: '+ New Case' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create Intervention Case' });
  await expect(dialog.getByRole('heading', { name: 'Create Intervention Case' })).toBeVisible();

  await dialog.getByLabel('Learner').fill(learnerName);
  await dialog.getByLabel('Cohort').fill('Learnership Cohort 2026-A');
  await dialog.getByLabel('Category').selectOption('Performance');
  await dialog.getByLabel('Risk').selectOption('high');
  await dialog.getByLabel('Owner').fill('Playwright Owner');
  await dialog.getByLabel('Due date').fill(toDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  await dialog.getByLabel('Resolution').selectOption('successful');
  await dialog.getByLabel('Notes').fill('Escalated attendance and appraisal delay intervention.');
  await dialog.getByRole('button', { name: 'Create Case' }).click();

  const caseRow = page.locator('tr', { hasText: learnerName }).first();
  await expect(caseRow).toBeVisible();
  await expect(caseRow).toContainText('Performance');
  await expect(caseRow).toContainText('successful');
  await expect(caseRow).toContainText('SLA 48h');

  const statusSelect = caseRow.locator('select.form-input').first();
  await expect(statusSelect).toHaveValue('open');
  await statusSelect.selectOption('in-progress');
  await expect(statusSelect).toHaveValue('in-progress');

  await caseRow.getByLabel(`Select case ${learnerName}`).check();
  await expect(casesCard).toContainText('1 selected');

  const downloadPromise = page.waitForEvent('download');
  await casesCard.getByRole('button', { name: 'Export Selected CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('intervention-selected-cases-');

  await caseRow.getByLabel(`Select case ${learnerName}`).check();
  await casesCard.getByLabel('Bulk owner').fill('Escalation Lead');
  await casesCard.getByRole('button', { name: 'Assign Owner Selected' }).click();
  await expect(caseRow).toContainText('Escalation Lead');

  await casesCard.locator('select.form-input').nth(3).selectOption('sla-alert');
  await expect(caseRow).toBeVisible();

  await casesCard.getByRole('button', { name: 'High Priority Preset' }).click();
  await expect(caseRow).toBeVisible();

  await statusSelect.selectOption('resolved');
  await expect(statusSelect).toHaveValue('resolved');

  const searchInput = page.locator('input[placeholder="Search learner, cohort, owner, category, or notes"]').first();
  await expect(searchInput).toBeEnabled();
  await searchInput.fill(learnerName);
  await expect(caseRow).toBeVisible({ timeout: 5000 });

  const learnerLookupSection = page.getByRole('heading', { name: 'Quick Learner Case Lookup' }).locator('..').locator('..');
  const learnerLookupInput = learnerLookupSection.getByPlaceholder('Search learner name to see all intervention cases');
  await expect(learnerLookupInput).toBeEnabled();
  await learnerLookupInput.fill(learnerName);
  const lookupResult = learnerLookupSection.locator('div', { hasText: 'Performance' }).first();
  await expect(lookupResult).toBeVisible({ timeout: 5000 });
});
