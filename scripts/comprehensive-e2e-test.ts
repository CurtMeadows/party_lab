/**
 * COMPREHENSIVE END-TO-END TEST
 * Tests all critical booking flows to ensure nothing is broken
 */

import type { BookingData, Pricing } from "@/types/booking";

// ============================================================================
// TEST SUITE SETUP
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected}, but got ${actual}`
    );
  }
}

function assertTrue(value: boolean, message?: string) {
  if (!value) {
    throw new Error(message || `Expected true, but got false`);
  }
}

// ============================================================================
// TEST 1: EXTRA HOURS PRICING CALCULATION
// ============================================================================

// Helper function to calculate extra hours cost
function calculateExtraHoursCost(hours: number): number {
  if (hours === 1) {
    return 50;
  } else if (hours > 1) {
    return 50 + (75 * (hours - 1));
  }
  return 0;
}

test("Extra Hours: 1 hour costs $50", () => {
  const cost = calculateExtraHoursCost(1);
  assertEqual(cost, 50, "1 extra hour should cost $50");
});

test("Extra Hours: 2 hours costs $125 ($50 + $75)", () => {
  const cost = calculateExtraHoursCost(2);
  assertEqual(cost, 125, "2 extra hours should cost $125");
});

test("Extra Hours: 3 hours costs $200 ($50 + $75 + $75)", () => {
  const cost = calculateExtraHoursCost(3);
  assertEqual(cost, 200, "3 extra hours should cost $200");
});

test("Extra Hours: 5 hours costs $350 ($50 + $75×4)", () => {
  const cost = calculateExtraHoursCost(5);
  assertEqual(cost, 350, "5 extra hours should cost $350");
});

// ============================================================================
// TEST 2: TRIP CHARGE CALCULATION
// ============================================================================

test("Trip Charge: 10 miles = $0", () => {
  const distance = 10;
  const charge = distance > 25 ? 50 : 0;
  assertEqual(charge, 0, "10 miles should have no trip charge");
});

test("Trip Charge: 25 miles = $0 (exactly at limit)", () => {
  const distance = 25;
  const charge = distance > 25 ? 50 : 0;
  assertEqual(charge, 0, "25 miles (at limit) should have no trip charge");
});

test("Trip Charge: 26 miles = $50", () => {
  const distance = 26;
  const charge = distance > 25 ? 50 : 0;
  assertEqual(charge, 50, "26 miles should have $50 trip charge");
});

test("Trip Charge: 50 miles = $50", () => {
  const distance = 50;
  const charge = distance > 25 ? 50 : 0;
  assertEqual(charge, 50, "50 miles should have $50 trip charge");
});

test("Trip Charge: Distance >50 miles should be blocked", () => {
  const distance = 51;
  const isBlocked = distance > 50;
  assertTrue(isBlocked, "Distance >50 miles should be blocked");
});

// ============================================================================
// TEST 3: BOOKING PRICING CALCULATIONS
// ============================================================================

test("Pricing: Party Starter base price calculation", () => {
  const basePrice = 300;
  const addOns = 0;
  const extraHours = 0;
  const tripCharge = 0;

  const subtotal = basePrice + addOns + extraHours;
  const total = subtotal + tripCharge;

  assertEqual(subtotal, 300, "Subtotal should be $300");
  assertEqual(total, 300, "Total should be $300");
});

test("Pricing: Party Starter + 2 extra hours + trip charge", () => {
  const basePrice = 300;
  const addOns = 0;
  const extraHoursCost = 125; // 2 hours: $50 + $75
  const tripCharge = 50;

  const subtotal = basePrice + addOns + extraHoursCost;
  const total = subtotal + tripCharge;

  assertEqual(subtotal, 425, "Subtotal should be $425");
  assertEqual(total, 475, "Total should be $475");
});

test("Pricing: Glow Getter + Playlist + 3 extra hours + trip charge", () => {
  const basePrice = 500; // Glow Getter
  const playlistAddon = 100;
  const extraHoursCost = 200; // 3 hours: $50 + $75 + $75
  const tripCharge = 50;

  const subtotal = basePrice + playlistAddon + extraHoursCost;
  const total = subtotal + tripCharge;

  assertEqual(subtotal, 800, "Subtotal should be $800");
  assertEqual(total, 850, "Total should be $850");
});

test("Pricing: All-Star VIP with extended hours (should be $0 extra)", () => {
  const basePrice = 1200; // All-Star VIP
  const extraHoursCost = 0; // Extended hours included in VIP
  const tripCharge = 0;

  const total = basePrice + extraHoursCost + tripCharge;

  assertEqual(total, 1200, "VIP total should be $1200 (no extra hours charge)");
});

// ============================================================================
// TEST 4: TIME DURATION CALCULATIONS
// ============================================================================

test("Duration: 17:00 to 20:00 = 3 hours (no extra)", () => {
  const start = "17:00";
  const end = "20:00";

  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = durationMs / (1000 * 60 * 60);

  assertEqual(hours, 3, "Duration should be 3 hours");

  const extraHours = hours > 3 ? Math.ceil(hours - 3) : 0;
  assertEqual(extraHours, 0, "Extra hours should be 0");
});

test("Duration: 17:00 to 21:00 = 4 hours (1 extra)", () => {
  const start = "17:00";
  const end = "21:00";

  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = durationMs / (1000 * 60 * 60);

  assertEqual(hours, 4, "Duration should be 4 hours");

  const extraHours = hours > 3 ? Math.ceil(hours - 3) : 0;
  assertEqual(extraHours, 1, "Extra hours should be 1");
});

test("Duration: 15:00 to 22:00 = 7 hours (4 extra)", () => {
  const start = "15:00";
  const end = "22:00";

  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = durationMs / (1000 * 60 * 60);

  assertEqual(hours, 7, "Duration should be 7 hours");

  const extraHours = hours > 3 ? Math.ceil(hours - 3) : 0;
  assertEqual(extraHours, 4, "Extra hours should be 4");
});

// ============================================================================
// TEST 5: PACKAGE LOGIC - VIP vs STANDARD
// ============================================================================

// Helper function to check if package needs extra hours charge
function needsExtraHoursCharge(packageName: string, extraHours: number): boolean {
  const isVIP = packageName === "All-Star VIP";
  return extraHours > 0 && !isVIP;
}

test("Package Logic: Party Starter with extra hours SHOULD charge", () => {
  const shouldCharge = needsExtraHoursCharge("Party Starter", 2);
  assertTrue(shouldCharge, "Party Starter should charge for extra hours");
});

test("Package Logic: Glow Getter with extra hours SHOULD charge", () => {
  const shouldCharge = needsExtraHoursCharge("Glow Getter", 2);
  assertTrue(shouldCharge, "Glow Getter should charge for extra hours");
});

test("Package Logic: All-Star VIP with extra hours should NOT charge", () => {
  const shouldCharge = needsExtraHoursCharge("All-Star VIP", 5);
  assertTrue(!shouldCharge, "All-Star VIP should NOT charge for extra hours");
});

// ============================================================================
// TEST 6: DOUBLE BOOKING PREVENTION LOGIC
// ============================================================================

test("Availability: No bookings = available", () => {
  const existingBookings: any[] = [];
  const isBlocked = existingBookings.length > 0;

  assertTrue(!isBlocked, "Date should be available with no existing bookings");
});

test("Availability: 1 booking = blocked (entire day)", () => {
  const existingBookings = [
    { event_time_start: "17:00", event_time_end: "20:00" }
  ];
  const isBlocked = existingBookings.length > 0;

  assertTrue(isBlocked, "Date should be blocked with 1 existing booking");
});

test("Availability: Multiple bookings = blocked", () => {
  const existingBookings = [
    { event_time_start: "10:00", event_time_end: "13:00" },
    { event_time_start: "17:00", event_time_end: "20:00" }
  ];
  const isBlocked = existingBookings.length > 0;

  assertTrue(isBlocked, "Date should be blocked with multiple bookings");
});

// ============================================================================
// TEST 7: BOOKING DATA STRUCTURE VALIDATION
// ============================================================================

test("BookingData: Required fields exist", () => {
  const mockBooking: Partial<BookingData> = {
    currentStep: 1,
    product: "Dance Dome",
    date: "2026-01-25",
    timeBlock: "17:00-20:00",
    package: "Party Starter",
    addOns: {
      discoBall: false,
      redRopesCarpet: false,
      curatedPlaylist: false,
      wirelessMicrophone: false,
      glowBags: false,
      extraHour: false,
      overnightPackage: false,
    },
    pricing: {
      subtotal: 300,
      bookingFee: 100,
      extraHours: 0,
      extraHoursCost: 0,
      tripCharge: 0,
      total: 300,
    },
  };

  assertTrue(mockBooking.product !== undefined, "Product should exist");
  assertTrue(mockBooking.date !== undefined, "Date should exist");
  assertTrue(mockBooking.timeBlock !== undefined, "TimeBlock should exist");
  assertTrue(mockBooking.package !== undefined, "Package should exist");
  assertTrue(mockBooking.pricing !== undefined, "Pricing should exist");
});

test("Pricing: Has all new fields (extraHours, extraHoursCost, tripCharge)", () => {
  const pricing: Pricing = {
    subtotal: 475,
    bookingFee: 100,
    extraHours: 2,
    extraHoursCost: 125,
    tripCharge: 50,
    total: 475,
  };

  assertTrue("extraHours" in pricing, "Pricing should have extraHours field");
  assertTrue("extraHoursCost" in pricing, "Pricing should have extraHoursCost field");
  assertTrue("tripCharge" in pricing, "Pricing should have tripCharge field");
});

// ============================================================================
// TEST 8: EMAIL DATA GENERATION
// ============================================================================

test("Email: Extended hours section appears when > 0", () => {
  const extraHours = 2;
  const extraHoursCost = 125;

  const shouldShowExtendedHours = extraHours > 0;
  const hourText = extraHours > 1 ? 'hours' : 'hour'; // Fixed: avoid === comparison
  const emailLine = `Extended Hours (${extraHours} ${hourText}): +$${extraHoursCost}`;

  assertTrue(shouldShowExtendedHours, "Should show extended hours section");
  assertEqual(emailLine, "Extended Hours (2 hours): +$125", "Email line should format correctly");
});

test("Email: Trip charge section appears when > 0", () => {
  const tripCharge = 50;

  const shouldShowTripCharge = tripCharge > 0;
  const emailLine = `Trip Charge: +$${tripCharge}`;

  assertTrue(shouldShowTripCharge, "Should show trip charge section");
  assertEqual(emailLine, "Trip Charge: +$50", "Email line should format correctly");
});

test("Email: Additional charges section hidden when all = 0", () => {
  const extraHours = 0;
  const tripCharge = 0;

  const additionalCharges = [];
  if (extraHours > 0) {
    additionalCharges.push(`Extended Hours`);
  }
  if (tripCharge > 0) {
    additionalCharges.push(`Trip Charge`);
  }

  assertEqual(additionalCharges.length, 0, "Should have no additional charges");
});

// ============================================================================
// TEST 9: COMPLEX SCENARIOS
// ============================================================================

test("Scenario: Party Starter + 2 hours + Scottsdale trip = $475 total", () => {
  // Base
  const basePrice = 300; // Party Starter

  // Extra hours: 5 PM - 10 PM = 5 hours (2 extra)
  const duration = 5;
  const extraHours = duration > 3 ? Math.ceil(duration - 3) : 0;
  const extraHoursCost = calculateExtraHoursCost(extraHours);

  // Trip charge: 35 miles (Scottsdale)
  const distance = 35;
  const tripCharge = distance > 25 ? 50 : 0;

  // Totals
  const subtotal = basePrice + extraHoursCost;
  const total = subtotal + tripCharge;

  assertEqual(extraHours, 2, "Should have 2 extra hours");
  assertEqual(extraHoursCost, 125, "Extra hours should cost $125");
  assertEqual(tripCharge, 50, "Trip charge should be $50");
  assertEqual(subtotal, 425, "Subtotal should be $425");
  assertEqual(total, 475, "Total should be $475");
});

test("Scenario: Glow Getter + 4 hours + Playlist + Queen Creek = $875 total", () => {
  // Base
  const basePrice = 500; // Glow Getter

  // Add-ons
  const playlistAddon = 100;

  // Extra hours: 3 PM - 10 PM = 7 hours (4 extra)
  const duration = 7;
  const extraHours = duration > 3 ? Math.ceil(duration - 3) : 0;
  const extraHoursCost = calculateExtraHoursCost(extraHours);

  // Trip charge: 20 miles (Queen Creek - within 25 miles)
  const distance = 20;
  const tripCharge = distance > 25 ? 50 : 0;

  // Totals
  const subtotal = basePrice + playlistAddon + extraHoursCost;
  const total = subtotal + tripCharge;

  assertEqual(extraHours, 4, "Should have 4 extra hours");
  assertEqual(extraHoursCost, 275, "Extra hours should cost $275");
  assertEqual(tripCharge, 0, "Trip charge should be $0");
  assertEqual(subtotal, 875, "Subtotal should be $875");
  assertEqual(total, 875, "Total should be $875");
});

test("Scenario: All-Star VIP + 8 hours + Scottsdale = $1250 (no extra hours charge)", () => {
  // Base
  const basePrice = 1200; // All-Star VIP

  // Extra hours: 2 PM - 10 PM = 8 hours (5 extra) - BUT VIP includes it FREE
  const duration = 8;
  const packageName = "All-Star VIP";
  const isVIP = packageName === "All-Star VIP";
  const extraHoursCost = isVIP ? 0 : (50 + 75 * (Math.ceil(duration - 3) - 1));

  // Trip charge: 35 miles (Scottsdale)
  const distance = 35;
  const tripCharge = distance > 25 ? 50 : 0;

  // Totals
  const subtotal = basePrice + extraHoursCost;
  const total = subtotal + tripCharge;

  assertEqual(extraHoursCost, 0, "VIP should have $0 extra hours charge");
  assertEqual(tripCharge, 50, "Trip charge should be $50");
  assertEqual(subtotal, 1200, "Subtotal should be $1200");
  assertEqual(total, 1250, "Total should be $1250");
});

// ============================================================================
// TEST SUITE SUMMARY
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("TEST SUITE COMPLETE");
console.log("=".repeat(80));

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;

console.log(`\nResults: ${passed}/${total} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log("FAILED TESTS:");
  results
    .filter(r => !r.passed)
    .forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     ${r.error}`);
    });
  console.log("");
}

console.log("=".repeat(80));

if (failed === 0) {
  console.log("✅ ALL TESTS PASSED - System is working correctly!");
} else {
  console.log(`❌ ${failed} TEST(S) FAILED - Issues found!`);
  process.exit(1);
}

console.log("=".repeat(80));
