import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function createBooking() {
  const bookingData = {
    product: "Dance Dome",
    package: "Party Starter",
    event_date: "2026-04-17",
    event_time_start: "17:00",  // Drop off 5 PM
    event_time_end: "21:00",    // Pick up 9 PM
    customer_name: "Jenny Downing",
    customer_email: "downingjaynee2@gmail.com",
    customer_phone: "520-257-6474",
    event_address: "699 E Montebella Ave",
    event_type: "5th Birthday Party",
    addon_playlist_projector: false,
    addon_red_ropes_carpet: false,
    addon_extra_hour: false,
    addon_glow_bags: false,
    extra_hours: 0,
    extra_hours_cost: 0,
    trip_charge: 0,
    subtotal: 250,
    booking_fee: 100,
    total: 250,
    stripe_payment_intent_id: "manual_april9_deposit_paid",
    payment_status: "paid",
    booking_status: "confirmed",
    special_requests: "5 year old birthday party. Driveway surface — bring tarp and sandbags. Drop off by 5 PM, pick up at 9 PM.",
    playlist_request: null,
    space_type: "Outdoor - Driveway",
    power_source: "Yes",
    wifi_music_access: null,
    surface_type: "Driveway",
    access_path: "Yes",
    hear_about_us: null,
  };

  console.log("Creating booking...");

  const { data, error } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return null;
  }

  console.log("Booking created successfully:", data.id);
  return data;
}

async function sendConfirmationEmail(booking: any) {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B5CF6; margin-bottom: 5px;">The Partylab AZ</h1>
        <h2 style="color: #333; margin-top: 0;">You're Confirmed! 🎉</h2>
      </div>

      <p style="color: #333; font-size: 16px;">Hi Jenny,</p>
      <p style="color: #333;">We are SO sorry for the delay in getting you this confirmation — we had a technical hiccup on our end but your booking is 100% locked in. Your deposit was received and we cannot wait to celebrate with your little one!</p>

      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8B5CF6; margin-top: 0;">Event Details</h3>
        <p><strong>Event:</strong> 5th Birthday Party</p>
        <p><strong>Date:</strong> Friday, April 17, 2026</p>
        <p><strong>Party Time:</strong> 6:00 PM – 9:00 PM</p>
        <p><strong>Drop Off:</strong> 5:00 PM</p>
        <p><strong>Pick Up:</strong> 9:00 PM</p>
        <p><strong>Location:</strong> 699 E Montebella Ave</p>
        <p><strong>Venue:</strong> Dance Dome</p>
        <p><strong>Package:</strong> Party Starter</p>
      </div>

      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8B5CF6; margin-top: 0;">What's Included</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Dance Dome Inflatable Nightclub</li>
          <li>Color-Changing LED Lighting</li>
          <li>Bluetooth Speaker Sound System</li>
          <li>3-Hour Rental</li>
          <li>Setup &amp; Teardown Included</li>
        </ul>
      </div>

      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #8B5CF6; margin-top: 0;">Pricing</h3>
        <p><strong>Dance Dome – Party Starter:</strong> $250</p>
        <p><strong>Trip Charge:</strong> $50</p>
        <hr style="border: 1px solid #ddd; margin: 10px 0;">
        <p style="font-size: 18px;"><strong>Total:</strong> $300</p>
        <p><strong>Deposit Paid:</strong> $100 ✅</p>
        <p><strong>Remaining Balance:</strong> $200 (due on event date)</p>
      </div>

      <div style="background: #fff8e1; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #856404; margin-top: 0;">Setup Notes</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Driveway surface — we will bring a tarp and sandbags</li>
          <li>We will arrive by 5:00 PM for setup</li>
          <li>Pickup at 9:00 PM after your party ends</li>
        </ul>
      </div>

      <p style="color: #333;">Thank you so much for your patience, Jenny. We promise to make it an amazing party for your little one! 🎈</p>

      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>Questions? Call or text us at <strong>(602) 799-5856</strong></p>
        <p>partylabaz@gmail.com | @partylabaz</p>
      </div>
    </div>
  `;

  console.log("Sending confirmation email to Jenny and partylabaz@gmail.com...");

  const { data, error } = await resend.emails.send({
    from: "The Partylab <bookings@partylabaz.com>",
    to: ["downingjaynee2@gmail.com"],
    bcc: ["partylabaz@gmail.com"],
    subject: "Your Partylab Booking is Confirmed! 🎉 April 17th Dance Dome",
    html: emailHtml,
  });

  if (error) {
    console.error("Error sending email:", error);
    return false;
  }

  console.log("Email sent successfully:", data?.id);
  return true;
}

async function main() {
  const booking = await createBooking();

  if (booking) {
    await sendConfirmationEmail(booking);
    console.log("\nBooking Summary:");
    console.log("================");
    console.log("Booking ID:", booking.id);
    console.log("Customer:", booking.customer_name);
    console.log("Date: April 17, 2026");
    console.log("Venue:", booking.product);
    console.log("Package:", booking.package);
    console.log("Total: $" + booking.total);
    console.log("Status:", booking.payment_status);
  }
}

main().catch(console.error);
