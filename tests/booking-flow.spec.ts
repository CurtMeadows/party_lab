import { test, expect, Page } from '@playwright/test';
import { format, addDays } from 'date-fns';

// The site is seasonally gated (closed May 2 – Oct 16, reopens Oct 17). Freeze
// the browser clock to this post-reopen date so the suite exercises the live
// booking flow year-round instead of failing while the real calendar is closed.
const MOCK_NOW = new Date('2026-10-20T12:00:00');

async function selectCalendarDate(page: Page, targetDate: Date) {
  const targetDay = targetDate.getDate();
  const targetMonthYear = format(targetDate, 'MMMM yyyy');
  await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) {
    const monthVisible = await page.getByText(targetMonthYear).first().isVisible();
    if (monthVisible) break;
    const nextButton = page.locator('button').filter({ has: page.locator('svg[class*="chevron"]') }).last();
    if (await nextButton.isVisible()) { await nextButton.click(); await page.waitForTimeout(300); }
  }
  await page.locator('table button').filter({ hasText: new RegExp(`^${targetDay}$`) }).first().click();
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

async function goToStep2(page: Page) {
  await page.getByRole('button', { name: /book now/i }).first().click();
  await page.getByRole('button', { name: /dance dome/i }).first().click();
  await page.getByRole('button', { name: /continue to experience/i }).click();
}

async function goToDateTime(page: Page) {
  await goToStep2(page);
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('heading', { name: /pick your date/i })).toBeVisible({ timeout: 5000 });
}

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(MOCK_NOW);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => localStorage.removeItem('partylab_booking'));
  });

  test('Step 1 — Venue selection loads with all 3 venues', async ({ page }) => {
    await page.getByRole('button', { name: /book now/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Choose Your Venue', exact: true }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /dance dome/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /light haus/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /club noir/i }).first()).toBeVisible();
    console.log('✅ Step 1: All 3 venues visible');
  });

  test('Step 2 — Experience screen shows Build Your Own with all add-ons', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByRole('heading', { name: /customize your experience/i })).toBeVisible({ timeout: 5000 });
    // All add-ons visible
    await expect(page.getByText('Red Ropes & Carpet')).toBeVisible();
    await expect(page.getByText('Glow-Up Party Bags')).toBeVisible();
    // Base price shown
    await expect(page.getByText('$450').first()).toBeVisible();
    console.log('✅ Step 2: Build Your Own, all add-ons visible, $450 base price');
  });

  test('Step 3 — Date picker shows summer closure notice', async ({ page }) => {
    await goToDateTime(page);
    await expect(page.getByText(/May 2|unavailable.*summer|summer.*heat/i).first()).toBeVisible();
    console.log('✅ Step 3: Summer closure notice visible in date picker');
  });

  test('Step 4 — Customer form validation works', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 5);
    await goToDateTime(page);
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue to info/i }).click();

    // Check the terms and try to submit with empty required fields
    await expect(page.getByLabel(/full name/i)).toBeVisible({ timeout: 5000 });
    await page.locator('#terms').check();
    await page.getByRole('button', { name: /continue to payment/i }).click({ force: true });

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    console.log('✅ Step 4: Validation catches empty required fields');
  });

  test('Pricing — Dance Dome base price is $450', async ({ page }) => {
    await goToStep2(page);
    await expect(page.getByText('$450').first()).toBeVisible();
    console.log('✅ Pricing: Dance Dome base = $450');
  });

  test('Complete flow — reaches payment screen with correct date and deposit', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 5);
    const targetDateFormatted = format(targetDate, 'MMMM d, yyyy');

    await goToDateTime(page);
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue to info/i }).click();

    await expect(page.getByLabel(/full name/i)).toBeVisible({ timeout: 5000 });
    await fillCustomerForm(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await expect(page.getByRole('heading', { name: /secure payment/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(targetDateFormatted)).toBeVisible();
    await expect(page.getByText(/\$100 deposit/i)).toBeVisible();

    console.log(`✅ Complete flow passed: date=${targetDateFormatted}, $100 deposit shown`);
  });

  test('Surface type — Grass, Rocks, Driveway options and stakes note', async ({ page }) => {
    const targetDate = addDays(MOCK_NOW, 5);
    await goToDateTime(page);
    await selectCalendarDate(page, targetDate);
    await expect(page.getByText('Start Time')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue to info/i }).click();

    const surfaceSelect = page.locator('select#surfaceType');
    await expect(surfaceSelect).toBeVisible({ timeout: 5000 });
    await expect(surfaceSelect.locator('option[value="Grass"]')).toHaveCount(1);
    await expect(surfaceSelect.locator('option[value="Rocks (need a tarp)"]')).toHaveCount(1);
    await expect(surfaceSelect.locator('option[value="Driveway"]')).toHaveCount(1);
    await expect(page.getByText(/stakes or sandbags/i)).toBeVisible();
    console.log('✅ Surface type: All correct options and helper note visible');
  });
});
