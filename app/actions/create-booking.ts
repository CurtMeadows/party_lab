"use server";

import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase-server";
import type { BookingData } from "@/types/booking";

// How long to wait on the database before treating it as down
const DB_TIMEOUT_MS = 6000;

// When the database is unreachable the customer has already paid, so the booking
// must not be lost. Email the full booking to the business inbox and hand back a
// reference ID so checkout completes normally.
async function saveBookingByEmail(bookingData: BookingData, paymentIntentId: string, reason: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured - cannot save booking by email");
    return null;
  }

  const bookingId = `PL-${paymentIntentId.slice(-8).toUpperCase()}`;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Partylab Booking System <bookings@partylabaz.com>",
    to: ["partylabaz@gmail.com"],
    subject: `⚠️ ACTION NEEDED: Paid booking NOT saved to database - ${bookingData.customer?.name} - ${bookingData.date}`,
    text: `
A customer paid their deposit but the booking could NOT be saved to the database.
The customer saw a normal confirmation. This email is the only record of the booking.

WHAT TO DO:
1. Check the calendar for a double booking - availability could not be verified.
2. Restore the Supabase database (it is probably paused).
3. Add this booking to the database manually.

Reference ID: ${bookingId}
Stripe Payment ID: ${paymentIntentId}
Database error: ${reason}

Product: ${bookingData.product}
Package: ${bookingData.package}
Date: ${bookingData.date}
Time: ${bookingData.timeBlock}
Name: ${bookingData.customer?.name}
Email: ${bookingData.customer?.email}
Phone: ${bookingData.customer?.phone}
Location: ${bookingData.customer?.address}
Deposit Paid: $${bookingData.pricing.bookingFee}
Total: $${bookingData.pricing.total}

FULL BOOKING DATA (for manual entry):
${JSON.stringify(bookingData, null, 2)}
    `.trim(),
  });

  if (error) {
    console.error("Failed to save booking by email:", error);
    return null;
  }

  return bookingId;
}

export async function createBooking(bookingData: BookingData, paymentIntentId: string) {
  try {
    if (!bookingData.product || !bookingData.package || !bookingData.customer || !bookingData.date || !bookingData.timeBlock) {
      return {
        success: false,
        error: "Missing required booking information",
      };
    }

    // Parse time block
    const [startTime, endTime] = bookingData.timeBlock.split("-");

    // Insert booking into Supabase using service role client
    const insert = supabaseServer
      .from("bookings")
      .insert({
        product: bookingData.product,
        package: bookingData.package,
        event_date: bookingData.date,
        event_time_start: startTime,
        event_time_end: endTime,
        customer_name: bookingData.customer.name,
        customer_email: bookingData.customer.email,
        customer_phone: bookingData.customer.phone,
        event_address: bookingData.customer.address,
        event_type: bookingData.customer.eventType,
        addon_disco_ball: bookingData.addOns.discoBall,
        addon_red_ropes_carpet: bookingData.addOns.redRopesCarpet,
        addon_curated_playlist: bookingData.addOns.curatedPlaylist,
        addon_wireless_microphone: bookingData.addOns.wirelessMicrophone,
        addon_glow_bags: bookingData.addOns.glowBags,
        addon_extra_hour: bookingData.addOns.extraHour,
        addon_overnight_package: bookingData.addOns.overnightPackage,
        extra_hours: bookingData.pricing.extraHours,
        extra_hours_cost: bookingData.pricing.extraHoursCost,
        trip_charge: bookingData.pricing.tripCharge,
        subtotal: bookingData.pricing.subtotal,
        booking_fee: bookingData.pricing.bookingFee,
        total: bookingData.pricing.total,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: "paid",
        booking_status: "confirmed",
        special_requests: bookingData.customer.specialRequests || null,
        playlist_request: bookingData.customer.playlistRequest || null,
        space_type: bookingData.customer.spaceType,
        power_source: bookingData.customer.powerSource,
        wifi_music_access: bookingData.customer.wifiMusicAccess,
        surface_type: bookingData.customer.surfaceType,
        access_path: bookingData.customer.accessPath,
        hear_about_us: bookingData.customer.hearAboutUs || null,
      })
      .select()
      .single();

    let dbError: string | null = null;
    let savedId: string | null = null;
    try {
      const { data, error } = await Promise.race([
        insert,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database timed out")), DB_TIMEOUT_MS)
        ),
      ]);
      if (error) {
        dbError = error.message || "Unknown database error";
      } else {
        savedId = data.id;
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
    }

    if (dbError || !savedId) {
      console.error("Supabase error:", dbError);
      const fallbackId = await saveBookingByEmail(bookingData, paymentIntentId, dbError || "No booking ID returned");
      if (!fallbackId) {
        return {
          success: false,
          error: "Failed to create booking in database",
        };
      }
      return {
        success: true,
        bookingId: fallbackId,
      };
    }

    return {
      success: true,
      bookingId: savedId,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
