"use server";

import { Resend } from "resend";
import { format } from "date-fns";

interface BookingReminder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product: string;
  package: string;
  event_date: string;
  event_time_start: string;
  event_time_end: string;
  event_address: string;
  space_type: string | null;
  power_source: string | null;
  wifi_music_access: string | null;
  surface_type: string | null;
  access_path: string | null;
  subtotal: number;
  booking_fee: number;
  total: number;
  addon_playlist_projector: boolean;
  addon_red_ropes_carpet: boolean;
  addon_extra_hour: boolean;
  addon_glow_bags: boolean;
}

export async function sendReminderEmail(booking: BookingReminder) {
  try {
    // Check for API key at runtime
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return { success: false, customerSent: false, businessSent: false };
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Parse date correctly
    const [year, month, day] = booking.event_date.split('-').map(Number);
    const formattedDate = format(new Date(year, month - 1, day), 'EEEE, MMMM d, yyyy');

    // Format times
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const startTime = formatTime(booking.event_time_start);
    const endTime = formatTime(booking.event_time_end);

    // Calculate arrival time (45-60 min before start)
    const startHour = parseInt(booking.event_time_start.split(':')[0]);
    const startMinute = parseInt(booking.event_time_start.split(':')[1]);
    const arrivalHour = startMinute >= 45 ? startHour - 1 : startHour - 1;
    const arrivalMinute = startMinute >= 45 ? startMinute - 45 : startMinute + 15;
    const arrivalAmpm = arrivalHour >= 12 ? 'PM' : 'AM';
    const arrivalDisplayHour = arrivalHour === 0 ? 12 : arrivalHour > 12 ? arrivalHour - 12 : arrivalHour;
    const estimatedArrival = `${arrivalDisplayHour}:${arrivalMinute.toString().padStart(2, '0')} ${arrivalAmpm}`;

    // Build add-ons list
    const addOnsList = [];
    if (booking.addon_playlist_projector) addOnsList.push('Playlist + Projector');
    if (booking.addon_red_ropes_carpet) addOnsList.push('Red Ropes & Carpet');
    if (booking.addon_extra_hour) addOnsList.push('Extra Hour');
    if (booking.addon_glow_bags) addOnsList.push('Glow-Up Party Bags');

    // Build checklist reminder
    const checklistItems = [
      `Space Type: ${booking.space_type || 'Not provided'}`,
      `Power Source: ${booking.power_source || 'Not provided'}`,
      `Wi-Fi/Music Access: ${booking.wifi_music_access || 'Not provided'}`,
      `Surface: ${booking.surface_type || 'Not provided'}`,
      `Access Path: ${booking.access_path || 'Not provided'}`,
    ];

    const remainingBalance = booking.total - booking.booking_fee;

    const customerEmailBody = `
Hi ${booking.customer_name},

We're getting ready for your party! 🎉

Your event is coming up in just 48 hours, and we wanted to send you a quick reminder with all the important details.

EVENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${formattedDate}
Time: ${startTime} - ${endTime}
Location: ${booking.event_address}

Product: ${booking.product}
Package: ${booking.package}
${addOnsList.length > 0 ? `Add-Ons: ${addOnsList.join(', ')}\n` : ''}
WHAT TO EXPECT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Our team will arrive between ${estimatedArrival} - ${startTime}
✅ We'll handle all setup so everything is ready for your start time
✅ Your ${booking.product} will be fully inflated and tested
✅ All lighting, sound, and entertainment will be ready to go

PRE-EVENT READINESS REMINDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm the following are ready:
${checklistItems.map(item => `• ${item}`).join('\n')}

💡 Make sure the setup area is clear of any debris, furniture, or obstacles.
💡 Have an outdoor electrical outlet accessible for our team.

PAYMENT REMINDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deposit Paid: $${booking.booking_fee}
Remaining Balance: $${remainingBalance}

We'll collect the remaining balance of $${remainingBalance} in person when we arrive. We accept cash, card, or digital payment.

QUESTIONS OR CHANGES?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you need to make any changes or have questions, please email us ASAP:
📧 partylabaz@gmail.com

We're so excited to bring the nightclub experience to your celebration!

See you soon,
The Partylab Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Partylab
Arizona's Premier Inflatable Nightclub for Kids
partylabaz@gmail.com
Instagram: @partylabaz
    `.trim();

    // Send to customer
    const { error: customerError } = await resend.emails.send({
      from: 'The Partylab <onboarding@resend.dev>',
      to: [booking.customer_email],
      subject: `Reminder: Your Party is in 48 Hours! 🎉`,
      text: customerEmailBody,
    });

    if (customerError) {
      console.error('Failed to send customer reminder:', customerError);
    }

    // Send business notification
    const businessEmailBody = `
EVENT REMINDER - 48 HOURS OUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Event Date: ${formattedDate}
⏰ Event Time: ${startTime} - ${endTime}
📍 Location: ${booking.event_address}

CUSTOMER INFO:
Name: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone}

BOOKING DETAILS:
Product: ${booking.product}
Package: ${booking.package}
${addOnsList.length > 0 ? `Add-Ons: ${addOnsList.join(', ')}\n` : ''}
ARRIVAL TIME:
Arrive between ${estimatedArrival} - ${startTime} for setup

PRE-EVENT CHECKLIST:
${checklistItems.map(item => `• ${item}`).join('\n')}

PAYMENT TO COLLECT:
Remaining Balance: $${remainingBalance} (cash/card on arrival)
Total Event Value: $${booking.total}

REMINDER SENT TO CUSTOMER: ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${booking.id}
    `.trim();

    const { error: businessError } = await resend.emails.send({
      from: 'Partylab Reminder System <onboarding@resend.dev>',
      to: ['partylabaz@gmail.com'],
      subject: `⏰ EVENT IN 48 HRS: ${booking.customer_name} - ${formattedDate}`,
      text: businessEmailBody,
    });

    if (businessError) {
      console.error('Failed to send business reminder:', businessError);
    }

    return {
      success: !customerError && !businessError,
      customerSent: !customerError,
      businessSent: !businessError,
    };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, customerSent: false, businessSent: false };
  }
}
