import { expect, test } from '@playwright/test';

function toDateTimeLocalValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

test('owner communications template and campaign workflow', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByPlaceholder('name@company.com').fill('owner@learnerassurance.com');
  await page.getByPlaceholder('Enter your password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/owner\/dashboard/);

  await page.goto('/owner/communications');
  await expect(page.getByRole('heading', { name: 'Communications', exact: true })).toBeVisible();

  const uniqueId = Date.now();
  const templateTitle = `Playwright Template ${uniqueId}`;
  const updatedTemplateTitle = `Playwright Template Updated ${uniqueId}`;
  const campaignTitle = `Playwright Campaign ${uniqueId}`;
  const composerCard = page.getByRole('heading', { name: 'Broadcast Composer' }).locator('..');

  await page.getByRole('button', { name: '+ New Template' }).click();
  const templateDialog = page.getByRole('dialog', { name: 'Create Communication Template' });
  const createTemplateButton = templateDialog.getByRole('button', { name: 'Create Template' });
  await expect(createTemplateButton).toBeDisabled();

  await templateDialog.getByLabel('Template title').fill(templateTitle);
  await templateDialog.getByLabel('Audience').fill('All Cohorts');
  await templateDialog.getByLabel('Channel').selectOption('Email');
  await templateDialog.getByLabel('Template body').fill('Please upload evidence before the deadline.');
  await expect(createTemplateButton).toBeEnabled();
  await createTemplateButton.click();

  const templateRow = page.locator('tr', { hasText: templateTitle }).first();
  await expect(templateRow).toBeVisible();

  await templateRow.getByRole('button', { name: 'Edit' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit Communication Template' });
  await editDialog.getByLabel('Template title').fill(updatedTemplateTitle);
  await editDialog.getByRole('button', { name: 'Save Template' }).click();

  await expect(page.locator('tr', { hasText: updatedTemplateTitle }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Use' }).first().click();
  await composerCard.getByPlaceholder('Campaign title').fill(campaignTitle);
  await composerCard.locator('select.form-input').nth(1).selectOption('Employer Sponsors');
  await composerCard.locator('select.form-input').nth(2).selectOption('SMS');
  await page.getByPlaceholder('Write your announcement or reminder').fill('This is a direct broadcast to employer sponsors.');

  const sendNowButton = page.getByRole('button', { name: 'Send Now' });
  await expect(sendNowButton).toBeEnabled();
  await sendNowButton.click();

  const campaignRow = page.locator('tr', { hasText: campaignTitle }).first();
  await expect(campaignRow).toBeVisible();
  await expect(campaignRow).toContainText('Sent');

  const scheduledTitle = `Playwright Scheduled ${uniqueId}`;
  await page.getByRole('button', { name: 'Use' }).first().click();
  await composerCard.getByPlaceholder('Campaign title').fill(scheduledTitle);
  await composerCard.locator('select.form-input').nth(1).selectOption('Operational owners');
  await composerCard.locator('select.form-input').nth(2).selectOption('Email');
  await page.getByPlaceholder('Write your announcement or reminder').fill('Operational update for owner team.');
  await composerCard.locator('input[type="datetime-local"]').fill(toDateTimeLocalValue(new Date(Date.now() + 3 * 60 * 60 * 1000)));

  const scheduleButton = page.getByRole('button', { name: 'Schedule' });
  await expect(scheduleButton).toBeEnabled();
  await scheduleButton.click();

  const scheduledRow = page.locator('tr', { hasText: scheduledTitle }).first();
  await expect(scheduledRow).toBeVisible();
  await expect(scheduledRow).toContainText('Scheduled');
});
