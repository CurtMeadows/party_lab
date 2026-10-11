"use server";

import Stripe from "stripe";
import type { BookingData } from "@/types/booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Copy the booking onto the Stripe payment so the details survive even if the
// database save and the notification email both fail after the customer pays.
// Stripe metadata values are capped at 500 characters.
function buildBookingMetadata(bookingData?: BookingData): Record<string, string> {
  if (!bookingData) return {};

  const clip = (value: unknown) => String(value ?? "").slice(0, 500);
  const addOns = Object.entries(bookingData.addOns || {})
    .filter(([, selected]) => selected)
    .map(([name]) => name)
    .join(", ");

  return {
    product: clip(bookingData.product),
    package: clip(bookingData.package),
    event_date: clip(bookingData.date),
    event_time: clip(bookingData.timeBlock),
    customer_phone: clip(bookingData.customer?.phone),
    event_address: clip(bookingData.customer?.address),
    event_type: clip(bookingData.customer?.eventType),
    add_ons: clip(addOns || "none"),
    extra_hours: clip(bookingData.pricing?.extraHours),
    trip_charge: clip(bookingData.pricing?.tripCharge),
    total: clip(bookingData.pricing?.total),
    space_type: clip(bookingData.customer?.spaceType),
    power_source: clip(bookingData.customer?.powerSource),
    wifi_music_access: clip(bookingData.customer?.wifiMusicAccess),
    surface_type: clip(bookingData.customer?.surfaceType),
    access_path: clip(bookingData.customer?.accessPath),
    special_requests: clip(bookingData.customer?.specialRequests),
    playlist_request: clip(bookingData.customer?.playlistRequest),
    hear_about_us: clip(bookingData.customer?.hearAboutUs),
  };
}

// Refresh the booking details on an existing payment (the customer may have
// gone back and changed something after the payment was first created).
export async function attachBookingToPayment(paymentIntentId: string, bookingData: BookingData) {
  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        customer_name: bookingData.customer?.name || "",
        customer_email: bookingData.customer?.email || "",
        ...buildBookingMetadata(bookingData),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error attaching booking to payment:", error);
    return { success: false };
  }
}

export async function createPaymentIntent(amount: number, customerEmail?: string, customerName?: string, bookingData?: BookingData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_types: [
        "card",           // Credit/debit cards
        "link",           // Stripe Link (one-click checkout)
        "us_bank_account", // ACH Direct Debit (bank account payments)
        "cashapp",        // Cash App Pay
      ],
      // Apple Pay and Google Pay are automatically included with "card"
      statement_descriptor_suffix: "DEPOSIT", // Shows on customer's bank statement
      description: "PartyLab Event Deposit",
      // Include customer email and name for Stripe receipts
      receipt_email: customerEmail,
      metadata: {
        customer_name: customerName || "",
        customer_email: customerEmail || "",
        ...buildBookingMetadata(bookingData),
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error: "Failed to create payment intent",
    };
  }
}
