"use server";

import { Resend } from "resend";
import { format } from "date-fns";
import { BASE_PRICES, REQUEST_ADD_ONS, REQUEST_DURATIONS, getBasePrice } from "@/lib/constants";
import { formatTime12Hour } from "@/lib/format-time";
import type { ProductType } from "@/types/booking";

export interface BookingRequest {
  product: ProductType | "Not sure";
  addOns: string[];
  date: string; // yyyy-MM-dd
  backupDate?: string;
  startTime: string; // HH:mm
  duration: string; // a REQUEST_DURATIONS value
  eventType: string;
  guestCount: string;
  location: string;
  setupSurface?: string;
  name: string;
  email: string;
  phone: string;
  hearAboutUs?: string;
  notes?: string;
  website?: string; // honeypot — real visitors never see or fill this
}

const clip = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return format(new Date(year, month - 1, day), "EEEE, MMMM d, yyyy");
}

export async function sendBookingRequest(request: BookingRequest) {
  // Bots fill every field; pretend it worked so they don't retry.
  if (request.website) return { success: true };

  const r = {
    product: clip(request.product, 40),
    date: clip(request.date, 10),
    backupDate: clip(request.backupDate, 10),
    startTime: clip(request.startTime, 5),
    duration: clip(request.duration, 20),
    eventType: clip(request.eventType, 60),
    guestCount: clip(request.guestCount, 20),
    location: clip(request.location, 200),
    setupSurface: clip(request.setupSurface, 60),
    name: clip(request.name, 100),
    email: clip(request.email, 200),
    phone: clip(request.phone, 30),
    hearAboutUs: clip(request.hearAboutUs, 100),
    notes: clip(request.notes, 2000),
  };

  if (!r.name || !r.email || !r.phone || !r.date || !r.startTime || !r.location) {
    return { success: false, error: "Please fill in all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const selectedAddOns = REQUEST_ADD_ONS.filter((addOn) => (request.addOns || []).includes(addOn.id));
  const duration = REQUEST_DURATIONS.find((d) => d.value === r.duration) ?? REQUEST_DURATIONS[0];
  const isKnownProduct = r.product in BASE_PRICES;
  const estimate = isKnownProduct
    ? getBasePrice(r.product) + selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0) + duration.price
    : null;
  const formattedDate = formatDate(r.date);

  const emailBody = `
NEW BOOKING REQUEST — check availability and reply to the customer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Party:
Venue: ${isKnownProduct ? `${r.product} (starting at $${getBasePrice(r.product)})` : "Not sure yet — help them choose"}
Add-Ons: ${selectedAddOns.length > 0 ? selectedAddOns.map((a) => `${a.name} (+$${a.price})`).join(", ") : "None"}
Length: ${duration.label}
Estimated Total: ${estimate !== null ? `$${estimate}` : "—"} (before any travel surcharge)

When & Where:
Preferred Date: ${formattedDate}
${r.backupDate ? `Backup Date: ${formatDate(r.backupDate)}\n` : ""}Start Time: ${formatTime12Hour(r.startTime)}
Event Type: ${r.eventType || "—"}
Guests: ${r.guestCount || "—"}
Location: ${r.location}
Setup Surface: ${r.setupSurface || "—"}

Customer:
Name: ${r.name}
Email: ${r.email}
Phone: ${r.phone}
How They Heard About Us: ${r.hearAboutUs || "—"}

${r.notes ? `Notes:\n${r.notes}\n\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No payment has been taken. Hit Reply to answer ${r.name} directly.
Submitted via the booking request form on partylabaz.com
  `.trim();

  // Local automated tests set this so they never send real email.
  if (process.env.BOOKING_REQUEST_DRY_RUN === "1") {
    console.log(emailBody);
    return { success: true };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return { success: false, error: "We couldn't send your request. Please email us at partylabaz@gmail.com." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Partylab Booking Requests <onboarding@resend.dev>",
      to: ["partylabaz@gmail.com"],
      replyTo: r.email,
      subject: `📅 Booking Request: ${r.name} – ${isKnownProduct ? r.product : "Venue TBD"} – ${formattedDate}`,
      text: emailBody,
    });

    if (error) {
      console.error("Error sending booking request:", error);
      return { success: false, error: "We couldn't send your request. Please email us at partylabaz@gmail.com." };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending booking request:", error);
    return { success: false, error: "We couldn't send your request. Please email us at partylabaz@gmail.com." };
  }
}
