-- ============================================================================
-- Database Migration - September 8, 2026
-- Purpose: Add 4 missing addon columns to bookings table
-- ============================================================================
-- Run this in your Supabase SQL Editor BEFORE reopening for bookings.
-- Supabase Dashboard: https://fsguskmmyjxcecibebbs.supabase.co
--
-- Found during end-to-end testing: app/actions/create-booking.ts always
-- writes addon_disco_ball, addon_curated_playlist, addon_wireless_microphone,
-- and addon_overnight_package on every booking insert, but none of these 4
-- columns exist on the live bookings table. Because Postgres rejects an
-- entire insert if any column is unknown, EVERY booking attempt fails to
-- save after a customer has already been charged. This migration adds the
-- missing columns so bookings save correctly again.
-- ============================================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_disco_ball BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_curated_playlist BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_wireless_microphone BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_overnight_package BOOLEAN DEFAULT false;

COMMENT ON COLUMN bookings.addon_disco_ball IS 'Disco Ball add-on selected (+$30)';
COMMENT ON COLUMN bookings.addon_curated_playlist IS 'Curated Playlist add-on selected (+$50)';
COMMENT ON COLUMN bookings.addon_wireless_microphone IS 'Wireless Microphone add-on selected (+$50)';
COMMENT ON COLUMN bookings.addon_overnight_package IS 'Overnight Package add-on selected (+$150)';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify all 4 columns were added successfully:

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN (
    'addon_disco_ball',
    'addon_curated_playlist',
    'addon_wireless_microphone',
    'addon_overnight_package'
  )
ORDER BY column_name;

-- Expected output: 4 rows, each boolean, default false

-- ============================================================================
-- Migration Complete!
-- ============================================================================
