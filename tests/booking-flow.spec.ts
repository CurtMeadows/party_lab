import { test, expect, Page } from '@playwright/test';
import { format, addDays } from 'date-fns';

// Customers no longer book and pay online. Every "Book" button opens the
// Request to Book modal, which emails the request to partylabaz@gmail.com.
// Run the local server with BOOKING_REQUEST_DRY_RUN=1 so these tests never
// send real email.

const requestDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

function dialog(page: Page) {
  return page.getByRole('dialog', { name: /request to book|request sent/i });
}

async function openFromHero(page: Page) {
  await page.getByRole('button', { name: /check availability/i }).first().click();
  await expect(dialog(page)).toBeVisible({ timeout: 5000 });
}

async function fillStep2(page: Page) {
  const d = dialog(page);
  await d.getByLabel(/preferred date/i).fill(requestDate);
  await d.getByLabel(/party start time/i).selectOption('14:00');
  await d.getByLabel(/type of event/i).selectOption('Birthday Party');
  await d.getByLabel(/how many guests/i).fill('20');
  await d.getByLabel(/where will it be set up/i).selectOption('Grass');
  await d.getByLabel(/party city or address/i).fill('Gilbert, AZ');
  await d.getByRole('button', { name: /next: your info/i }).click();
}

async function fillStep3(page: Page) {
  const d = dialog(page);
  await d.getByLabel(/your name/i).fill('Test Customer');
  await d.getByLabel(/^email/i).fill('test@example.com');
  await d.getByLabel(/^phone/i).fill('602-555-1234');
  await d.getByLabel(/how did you hear/i).selectOption('Instagram');
  await d.getByLabel(/anything else/i).fill('Automated test — please ignore');
}

test.describe('Booking Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Self-booking is gone — no online checkout anywhere', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^book now$/i })).toHaveCount(0);
    await openFromHero(page);
    await expect(page.getByText(/secure payment/i)).toHaveCount(0);
    await expect(dialog(page).getByText(/no payment needed/i)).toBeVisible();
    await expect(page.getByText(/fully insured/i)).toHaveCount(0);
    await expect(page.getByText(/curated playlist/i)).toHaveCount(0);
    console.log('✅ No self-booking: hero opens Request to Book, no payment screen');
  });

  test('Step 1 — venues at new prices and current add-ons only', async ({ page }) => {
    await openFromHero(page);
    const d = dialog(page);
    await expect(d.getByRole('button', { name: /dance dome.*starting at \$500/i })).toBeVisible();
    await expect(d.getByRole('button', { name: /light haus.*starting at \$600/i })).toBeVisible();
    await expect(d.getByRole('button', { name: /club noir.*starting at \$600/i })).toBeVisible();
    await expect(d.getByRole('button', { name: /disco ball.*\+\$50/i })).toBeVisible();
    await expect(d.getByRole('button', { name: /red ropes & carpet.*\+\$100/i })).toBeVisible();
    await expect(d.getByRole('button', { name: /wireless microphone.*\+\$50/i })).toBeVisible();
    await expect(d.getByText(/glow-up party bags/i)).toHaveCount(0);
    await expect(d.getByText(/curated playlist/i)).toHaveCount(0);
    console.log('✅ Step 1: $500 / $600 / $600, Disco Ball $50, Red Ropes $100, removed add-ons gone');
  });

  test('Estimate — Light Haus + Disco Ball + Red Ropes + 4 hours = $800', async ({ page }) => {
    await openFromHero(page);
    const d = dialog(page);
    await d.getByRole('button', { name: /light haus/i }).click();
    await d.getByRole('button', { name: /disco ball/i }).click();
    await d.getByRole('button', { name: /red ropes & carpet/i }).click();
    await d.getByLabel(/how long/i).selectOption('4');
    await expect(d.getByText('$800', { exact: true })).toBeVisible();
    console.log('✅ Estimate: $600 + $50 + $100 + $50 = $800');
  });

  test('Build Your Party choices carry into the request', async ({ page }) => {
    const section = page.locator('#packages');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByText('Starting at $500')).toBeVisible();
    await expect(section.getByText('Starting at $600')).toHaveCount(2);
    await section.getByRole('button', { name: /dance dome/i }).click();
    await expect(section.getByRole('button', { name: /glow-up party bags/i })).toHaveCount(0);
    await expect(section.getByRole('button', { name: /curated playlist/i })).toHaveCount(0);
    await section.getByRole('button', { name: /disco ball/i }).click();
    await expect(section.getByText('$550', { exact: true })).toBeVisible();
    await section.getByRole('button', { name: /request to book/i }).click();

    const d = dialog(page);
    await expect(d).toBeVisible({ timeout: 5000 });
    await expect(d.getByRole('button', { name: /dance dome/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(d.getByRole('button', { name: /disco ball/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(d.getByText('$550', { exact: true })).toBeVisible();
    console.log('✅ Build Your Party: Dance Dome + Disco Ball = $550, carried into the request');
  });

  test('Validation — date, time, location, name, email and phone are required', async ({ page }) => {
    await openFromHero(page);
    const d = dialog(page);
    await d.getByRole('button', { name: /next: date/i }).click();
    await d.getByRole('button', { name: /next: your info/i }).click();
    await expect(d.getByText(/please choose a date/i)).toBeVisible();
    await expect(d.getByText(/please choose a start time/i)).toBeVisible();
    await expect(d.getByText(/city or address/i).last()).toBeVisible();

    await fillStep2(page);
    await d.getByLabel(/^email/i).fill('not-an-email');
    await d.getByRole('button', { name: /send booking request/i }).click();
    await expect(d.getByText(/name is required/i)).toBeVisible();
    await expect(d.getByText(/valid email/i)).toBeVisible();
    await expect(d.getByText(/phone is required/i)).toBeVisible();
    console.log('✅ Validation: required fields enforced on steps 2 and 3');
  });

  test('Complete request — sends and shows confirmation with summary', async ({ page }) => {
    await openFromHero(page);
    const d = dialog(page);
    await d.getByRole('button', { name: /club noir/i }).click();
    await d.getByRole('button', { name: /red ropes & carpet/i }).click();
    await d.getByRole('button', { name: /next: date/i }).click();
    await fillStep2(page);
    await fillStep3(page);
    await d.getByRole('button', { name: /send booking request/i }).click();

    await expect(page.getByRole('heading', { name: /request sent/i })).toBeVisible({ timeout: 15000 });
    await expect(d.getByText(/we got your request/i)).toBeVisible();
    await expect(d.getByText('test@example.com')).toBeVisible();
    await expect(d.getByText('$700', { exact: true })).toBeVisible(); // $600 + $100
    console.log('✅ Complete request: sent, confirmation shows Club Noir + Red Ropes = $700');
  });

  test('Announcement banner is gone', async ({ page }) => {
    await expect(page.getByText(/we.re open again/i)).toHaveCount(0);
    await expect(page.getByText(/planning a party\?/i)).toHaveCount(0);
    console.log('✅ Banner removed');
  });
});
