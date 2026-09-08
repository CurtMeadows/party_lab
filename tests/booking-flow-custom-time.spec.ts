import { test, expect, Page } from '@playwright/test';
import { format, addDays } from 'date-fns';

// The site is seasonally gated (closed May 2 – Oct 16, reopens Oct 17). Freeze
// the browser clock to this post-reopen date so the suite exercises the live
// booking flow year-round instead of failing while the real calendar is closed.
const MOCK_NOW = new Date('2026-10-20T12:00:00');

/**
 * E2E tests for custom time selection in the booking flow
 * Current flow: Venue → Experience → Date & Time → Customer Info → Payment
 */

async function selectCalendarDate(page: Page, targetDate: Date) {
  const targetDay = targetDate.getDate();
  const targetMonthYear = format(targetDate, 'MMMM yyyy');

  await page.waitForTimeout(500);

  for (let i = 0; i < 6; i++) {
    const monthVisible = await page.getByText(targetMonthYear).first().isVisible();
    if (monthVisible) break;
    const nextButton = page.locator('button').filter({ has: page.locator('svg[class*="chevron"]') }).last();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);
    }
  }

  await page.locator('table button').filter({ hasText: new RegExp(`^${targetDay}$`) }).first().click();
}

async function setCustomTime(
  page: Page,
  startHour: string, startMinute: string, startPeriod: string,
  endHour: string, endMinute: string, endPeriod: string
) {
  const startLabel = page.getByText('Start Time', { exact: true });
  const startSelects = startLabel.locator('..').locator('select');
  await startSelects.nth(0).selectOption(startHour);
  await startSelects.nth(1).selectOption(startMinute);
  await startSelects.nth(2).selectOption(startPeriod);

  const endLabel = page.getByText('End Time', { exact: true });
  const endSelects = endLabel.locator('..').locator('select');
  await endSelects.nth(0).selectOption(endHour);
  await endSelects.nth(1).selectOption(endMinute);
  await endSelects.nth(2).selectOption(endPeriod);
}

async function fillCustomerForm(page: Page) {
  await page.getByLabel(/full name/i).fill('Test Customer');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/phone/i).fill('602-555-1234');
  await page.getByLabel(/event address/i).fill('123 Test St, Phoenix, AZ 85001');
  await page.locator('select#eventType').selectOption('Birthday Party');
  await page.getByRole('radio', { name: 'Yes' }).first().check();
  await page.locator('select#surfaceType').selectOption('Grass');
  await page.getByRole('radio', { name: 'Yes' }).nth(1).check();
  await page.getByRole('radio', { name: 'Yes' }).nth(2).check();
  await page.getByRole('radio', { name: 'Yes' }).nth(3).check();
  await page.locator('#terms').check();
}

/** Navigate from homepage to the Date & Time screen */
async function navigateToDateTime(page: Page) {
  await page.getByRole('button', { name: /book now/i }).first().click();
  await page.getByRole('button', { name: /dance dome/i }).first().click();
  await page.getByRole('button', { name: /continue to experience/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('heading', { name: /pick your date/i })).toBeVisible({ timeout: 5000 });
}

test.describe('Booking Flow - Custom Time Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(MOCK_NOW);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.removeItem('partylab_booking'));
  });

  test('Complete booking flow with custom time selection', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 5);
    const targetDateFormatted = format(targetDate, 'MMMM d, yyyy');

    await navigateToDateTime(page);

    // Select date and set custom time 6-9 PM
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });
    await setCustomTime(page, '6', '00', 'PM', '9', '00', 'PM');
    await expect(page.getByText(/Duration: 3 hours/i)).toBeVisible();

    await page.getByRole('button', { name: /continue to info/i }).click();

    // Customer Info
    await expect(page.getByLabel(/full name/i)).toBeVisible({ timeout: 5000 });
    await fillCustomerForm(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // Payment screen
    await expect(page.getByText(/secure payment/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(targetDateFormatted)).toBeVisible();
    await expect(page.getByText(/6:00 PM/)).toBeVisible();
    await expect(page.getByText(/9:00 PM/)).toBeVisible();

    console.log('✅ Custom time flow complete: 6-9 PM confirmed on payment screen');
  });

  test('Custom time validation: End time must be after start time', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 5);

    await navigateToDateTime(page);
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });

    // Invalid time: end before start
    await setCustomTime(page, '8', '00', 'PM', '5', '00', 'PM');
    await expect(page.getByText(/End time must be after start time/i)).toBeVisible();

    // Continue button should be disabled
    await expect(page.getByRole('button', { name: /continue to info/i })).toBeDisabled();

    // Fix the times
    await setCustomTime(page, '6', '00', 'PM', '9', '00', 'PM');
    await expect(page.getByText(/Duration: 3 hours/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue to info/i })).toBeEnabled();

    console.log('✅ Time validation works: invalid time blocked, valid time enabled');
  });

  test('Date accuracy: Selected date matches payment screen date', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 7);
    const targetDateFormatted = format(targetDate, 'MMMM d, yyyy');

    await navigateToDateTime(page);
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });
    await setCustomTime(page, '6', '00', 'PM', '9', '00', 'PM');
    await page.getByRole('button', { name: /continue to info/i }).click();

    await expect(page.getByLabel(/full name/i)).toBeVisible({ timeout: 5000 });
    await fillCustomerForm(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await expect(page.getByText(/secure payment/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(targetDateFormatted)).toBeVisible();

    console.log(`✅ Date accuracy confirmed: ${targetDateFormatted} matches on payment screen`);
  });
});
