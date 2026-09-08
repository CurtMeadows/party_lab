import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function fmt12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function fmtDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

async function run() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      event_date, event_time_start, event_time_end,
      customer_name, customer_phone, customer_email,
      event_address, event_type, product, package,
      surface_type, space_type, access_path, power_source,
      addon_red_ropes_carpet, addon_glow_bags,
      addon_playlist_projector,
      addon_extra_hour,
      playlist_request, special_requests,
      payment_status, total
    `)
    .gte('event_date', '2026-04-04')
    .lte('event_date', '2026-05-01')
    .order('event_date', { ascending: true });

  if (error) { console.log('Error:', error); return; }
  if (!data || data.length === 0) { console.log('No bookings found'); return; }

  data.forEach((b, i) => {
    const addOns = [
      b.addon_red_ropes_carpet && 'Red Ropes & Carpet',
      b.addon_glow_bags && 'Glow Bags',
      b.addon_playlist_projector && 'Playlist/Projector',
      b.addon_extra_hour && 'Extra Hour',
    ].filter(Boolean);

    console.log('─'.repeat(50));
    console.log(`BOOKING ${i + 1} of ${data.length}`);
    console.log('─'.repeat(50));
    console.log(`📅 ${fmtDate(b.event_date)}`);
    console.log(`⏰ ${fmt12(b.event_time_start)} – ${fmt12(b.event_time_end)}`);
    console.log(`📍 ${b.event_address}`);
    console.log('');
    console.log(`👤 ${b.customer_name}`);
    console.log(`📞 ${b.customer_phone}`);
    console.log(`✉️  ${b.customer_email}`);
    console.log(`🎉 Event Type: ${b.event_type}`);
    console.log('');
    console.log(`🎪 Venue: ${b.product}  |  Package: ${b.package}`);
    console.log(`💳 Payment: ${b.payment_status.toUpperCase()}  |  Total: $${b.total}`);
    console.log('');
    console.log('SITE DETAILS');
    console.log(`  Surface:     ${b.surface_type || '—'}`);
    console.log(`  Space Type:  ${b.space_type || '—'}`);
    console.log(`  Access Path: ${b.access_path || '—'}`);
    console.log(`  Power:       ${b.power_source || '—'}`);
    if (addOns.length > 0) {
      console.log('');
      console.log('ADD-ONS');
      addOns.forEach(a => console.log(`  ✓ ${a}`));
    }
    if (b.playlist_request) {
      console.log('');
      console.log(`🎵 Playlist Request: ${b.playlist_request}`);
    }
    if (b.special_requests) {
      console.log('');
      console.log(`📝 Special Requests: ${b.special_requests}`);
    }
    console.log('');
  });

  console.log('─'.repeat(50));
  console.log(`Total bookings: ${data.length}`);
}

run();
