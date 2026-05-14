import { expect, test } from '@playwright/test';

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

test('owner compliance control creation and remediation workflow', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/compliance');
  await expect(page.getByRole('heading', { name: 'Compliance', exact: true })).toBeVisible();
  const worklistCard = page.getByRole('heading', { name: 'Compliance Worklist' }).locator('..').locator('..');

  const uniqueId = Date.now();
  const controlName = `Playwright Compliance Control ${uniqueId}`;

  await page.getByRole('button', { name: '+ New Control' }).click();
  const controlDialog = page.getByRole('dialog', { name: 'Add Compliance Control' });
  const addControlButton = controlDialog.getByRole('button', { name: 'Add Control' });

  await expect(addControlButton).toBeDisabled();
  await controlDialog.getByLabel('Control area').fill(controlName);
  await controlDialog.getByLabel('Owner').fill('Playwright Compliance Owner');
  await controlDialog.getByLabel('Due date').fill(toDateValue(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)));
  await controlDialog.getByLabel('Status').selectOption('at-risk');
  await controlDialog.getByLabel('Missing evidence').fill('3');
  await controlDialog.getByLabel('Missing appraisals').fill('2');

  await expect(addControlButton).toBeEnabled();
  await addControlButton.click();

  await worklistCard.getByPlaceholder('Search area, owner, status, or cohort').fill(controlName);
  const controlRow = page.locator('tr', { hasText: controlName }).first();
  await expect(controlRow).toBeVisible();
  await expect(controlRow).toContainText('At Risk');

  await controlRow.getByLabel(`Select control ${controlName}`).check();
  await expect(worklistCard).toContainText('1 selected');
  await worklistCard.getByRole('button', { name: 'Escalate Selected' }).click();
  await expect(controlRow).toContainText('Escalated');

  await controlRow.getByLabel(`Select control ${controlName}`).check();
  await worklistCard.getByRole('button', { name: 'Assign Remediation Selected' }).click();
  const bulkPlanDialog = page.getByRole('dialog', { name: 'Assign Remediation Plan to Selected Controls' });
  await bulkPlanDialog.getByLabel('Remediation owner').fill('QA Remediation Lead');
  await bulkPlanDialog.getByLabel('Due date').fill(toDateValue(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)));
  await bulkPlanDialog.getByLabel('Notes').fill('Execute targeted evidence and appraisal recovery plan.');
  await bulkPlanDialog.getByRole('button', { name: 'Assign Plan' }).click();

  await expect(controlRow).toContainText('planned');

  await controlRow.getByLabel(`Select control ${controlName}`).check();
  const selectedDownloadPromise = page.waitForEvent('download');
  await worklistCard.getByRole('button', { name: 'Export Selected CSV' }).click();
  const selectedDownload = await selectedDownloadPromise;
  expect(selectedDownload.suggestedFilename()).toContain('compliance-selected-controls-');

  await worklistCard.getByRole('button', { name: 'Due Soon Preset' }).click();
  await expect(page.locator('tr', { hasText: controlName }).first()).toBeVisible();

  await worklistCard.getByPlaceholder('Search area, owner, status, or cohort').fill('');
  await worklistCard.locator('select.form-input').nth(2).selectOption('due-soon');
  await expect(page.locator('tr', { hasText: controlName }).first()).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await worklistCard.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('compliance-worklist-');
});
