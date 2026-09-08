import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { addDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    // Check for API key at runtime
    if (!process.env.RESEND_API_KEY) {
      console.error("[CRON] RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate target date (48 hours from now)
    const targetDate = addDays(new Date(), 2);
    const targetDateString = format(targetDate, 'yyyy-MM-dd');

    console.log(`[CRON] Checking for events on ${targetDateString}`);

    // Find bookings that need reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_date', targetDateString)
      .eq('booking_status', 'confirmed')
      .eq('payment_status', 'paid')
      .is('reminder_sent_at', null);

    if (error) {
      console.error('[CRON] Database error:', error);
      throw error;
    }

    if (!bookings || bookings.length === 0) {
      console.log('[CRON] No reminders to send');
      return NextResponse.json({ message: 'No reminders to send', count: 0 });
    }

    console.log(`[CRON] Found ${bookings.length} booking(s) to remind`);

    let successCount = 0;
    const errors = [];

    for (const booking of bookings) {
      try {
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
        let arrivalHour = startHour;
        let arrivalMinute = startMinute - 45;

        if (arrivalMinute < 0) {
          arrivalHour -= 1;
          arrivalMinute += 60;
        }

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
If you need to make any changes or have questions, please call or text us ASAP:
📞 (602) 799-5856

We're so excited to bring the nightclub experience to your celebration!

See you soon,
The Partylab Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Partylab
Arizona's Premier Inflatable Nightclub for Kids
(602) 799-5856
partylabaz@gmail.com
Instagram: @partylabaz
        `.trim();

        // Send customer version to partylab for review/forwarding
        const { error: customerError } = await resend.emails.send({
          from: 'The Partylab <onboarding@resend.dev>',
          to: ['partylabaz@gmail.com'],
          subject: `[FOR CUSTOMER] Reminder: ${booking.customer_name}'s Party in 48 Hours! 🎉`,
          text: `TO FORWARD TO: ${booking.customer_email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${customerEmailBody}`,
        });

        if (customerError) {
          console.error(`[CRON] Customer email failed for ${booking.id}:`, customerError);
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
${addOnsList.length > 0 ? `Add-Ons: ${addOnsList.join(', ')}\n` : ''}${booking.playlist_request ? `Playlist Request: ${booking.playlist_request}\n` : ''}
ARRIVAL TIME:
Arrive between ${estimatedArrival} - ${startTime} for setup

PRE-EVENT CHECKLIST:
${checklistItems.map(item => `• ${item}`).join('\n')}

PAYMENT TO COLLECT:
Remaining Balance: $${remainingBalance} (cash/card on arrival)
Total Event Value: $${booking.total}

REMINDER SENT TO CUSTOMER: ${customerError ? '❌' : '✅'}

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
          console.error(`[CRON] Business email failed for ${booking.id}:`, businessError);
        }

        // Mark reminder as sent if at least one email succeeded
        if (!customerError || !businessError) {
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('id', booking.id);

          if (updateError) {
            console.error(`[CRON] Failed to update reminder_sent_at for ${booking.id}:`, updateError);
          } else {
            successCount++;
          }
        }

        if (customerError && businessError) {
          errors.push({ booking_id: booking.id, error: 'Both emails failed' });
        }

      } catch (bookingError) {
        console.error(`[CRON] Error processing booking ${booking.id}:`, bookingError);
        errors.push({ booking_id: booking.id, error: String(bookingError) });
      }
    }

    console.log(`[CRON] Successfully sent ${successCount}/${bookings.length} reminders`);

    return NextResponse.json({
      message: 'Reminder processing complete',
      total: bookings.length,
      successful: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders', details: String(error) },
      { status: 500 }
    );
  }
}
