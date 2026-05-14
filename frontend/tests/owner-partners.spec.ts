import { expect, test } from '@playwright/test';

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

test('owner partners employer and institute workflows', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/partners');
  await expect(page.getByRole('heading', { name: 'Partners', exact: true })).toBeVisible();

  const uniqueId = Date.now();
  const roleTitle = `Playwright Role ${uniqueId}`;
  const offeringName = `Playwright Programme ${uniqueId}`;

  await page.getByRole('button', { name: '+ Add Learner to Pipeline' }).click();
  const shortlistDialog = page.getByRole('dialog', { name: 'Add Learner to Employer Pipeline' });
  await expect(shortlistDialog.getByRole('heading', { name: 'Add Learner to Employer Pipeline' })).toBeVisible();

  await shortlistDialog.getByLabel('Employer').selectOption({ label: 'Acme Manufacturing' });
  await shortlistDialog.getByLabel('Learner').selectOption({ index: 1 });
  await shortlistDialog.getByLabel('Target role').fill(roleTitle);
  await shortlistDialog.getByRole('button', { name: 'Add to Pipeline' }).click();

  const pipelineRow = page.locator('tr', { hasText: roleTitle }).first();
  await expect(pipelineRow).toBeVisible();

  const statusSelect = pipelineRow.locator('select.form-input').first();
  await statusSelect.selectOption('hired');
  await expect(statusSelect).toHaveValue('hired');

  await page.getByRole('button', { name: '+ Add Programme Offering' }).click();
  const offeringDialog = page.getByRole('dialog', { name: 'Add Institute Offering' });
  await expect(offeringDialog.getByRole('heading', { name: 'Add Institute Offering' })).toBeVisible();

  await offeringDialog.getByLabel('Institute').selectOption({ label: 'North Skills Institute' });
  await offeringDialog.getByLabel('Programme name').fill(offeringName);
  await offeringDialog.getByLabel('NQF level').fill('5');
  await offeringDialog.getByLabel('Seats').fill('60');
  await offeringDialog.getByLabel('Certificate').fill('Advanced Skills Certificate');
  await offeringDialog.getByLabel('Accreditation code').fill(`PW-ACC-${uniqueId}`);

  const expiryInput = offeringDialog.getByLabel('Accreditation expiry');
  const tomorrow = toDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000));
  await expiryInput.fill(tomorrow);
  await expect(expiryInput).toHaveAttribute('min', /\d{4}-\d{2}-\d{2}/);

  await offeringDialog.getByRole('button', { name: 'Create Offering' }).click();

  const offeringRow = page.locator('tr', { hasText: offeringName }).first();
  await expect(offeringRow).toBeVisible();

  await offeringRow.getByRole('button', { name: 'Expired' }).click();
  await expect(offeringRow).toContainText('Escalated');
});

test('owner partner create validation rules', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/partners');
  await page.getByRole('button', { name: '+ Add Partner' }).click();

  const partnerDialog = page.getByRole('dialog', { name: 'Add Partner' });
  const createButton = partnerDialog.getByRole('button', { name: 'Create Partner' });
  const uniqueId = Date.now();
  const partnerName = `Playwright Employer ${uniqueId}`;

  await partnerDialog.getByLabel('Partner name').fill('AB');
  await partnerDialog.getByLabel('Account manager').fill('Valid Manager');
  await partnerDialog.getByLabel('SLA threshold').fill('95%');
  await createButton.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Partner name must be at least 3 characters.' }).first()).toBeVisible();

  await partnerDialog.getByLabel('Partner name').fill(partnerName);
  await partnerDialog.getByLabel('Account manager').fill('AB');
  await createButton.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Account manager must be at least 3 characters.' }).first()).toBeVisible();

  await partnerDialog.getByLabel('Account manager').fill('Valid Manager');
  await partnerDialog.getByLabel('SLA threshold').fill('95');
  await createButton.click();
  await expect(page.getByRole('alert').filter({ hasText: 'Threshold format should look like 95%.' }).first()).toBeVisible();

  await partnerDialog.getByLabel('SLA threshold').fill('96%');
  await createButton.click();

  await expect(partnerDialog).toBeHidden();
  await expect(page.locator('tr', { hasText: partnerName }).first()).toBeVisible();
});

test('owner partner edit and activation lifecycle', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/partners');

  const partnerRow = page.locator('tr', { hasText: 'Acme Manufacturing' }).first();
  await expect(partnerRow).toBeVisible();

  await partnerRow.getByRole('button', { name: 'Edit' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Update Partner' });
  await expect(editDialog.getByRole('heading', { name: 'Update Partner' })).toBeVisible();

  await editDialog.getByLabel('Account manager').fill('Updated Manager');
  await editDialog.getByLabel('SLA threshold').fill('97%');
  await editDialog.getByRole('button', { name: 'Save Partner' }).click();

  await expect(editDialog).toBeHidden();
  await expect(partnerRow).toContainText('Updated Manager');
  await expect(partnerRow).toContainText('97%');

  const deactivateButton = partnerRow.getByRole('button', { name: 'Deactivate' });
  await expect(deactivateButton).toBeVisible();
  await deactivateButton.click();
  await expect(partnerRow.getByRole('button', { name: 'Activate' })).toBeVisible();

  await partnerRow.getByRole('button', { name: 'Activate' }).click();
  await expect(partnerRow.getByRole('button', { name: 'Deactivate' })).toBeVisible();
});
