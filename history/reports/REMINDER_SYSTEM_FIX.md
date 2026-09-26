# 🚨 48-Hour Reminder System - Issue & Fix

**Date**: January 22, 2026
**Status**: ❌ NOT WORKING - Database column missing
**Impact**: No reminder emails are being sent to partylabaz@gmail.com

---

## 🔍 Problem Identified

The 48-hour reminder system is **NOT working** because:

### ❌ **Critical Issue: Missing Database Column**
The `bookings` table is missing the `reminder_sent_at` column that the cron job requires.

**What's happening**:
1. Cron job runs daily at 10:00 AM
2. Tries to query bookings where `reminder_sent_at IS NULL`
3. **Query fails** because column doesn't exist
4. No emails sent
5. No errors visible to you (fails silently in Vercel logs)

---

## ✅ How to Fix It

### **Step 1: Add the Missing Database Column** (REQUIRED)

1. Open Supabase SQL Editor: https://fsguskmmyjxcecibebbs.supabase.co
2. Go to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add reminder_sent_at column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for query performance
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent
ON bookings(reminder_sent_at)
WHERE reminder_sent_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.reminder_sent_at IS
'Timestamp when 48-hour reminder email was sent. NULL means reminder not yet sent.';
```

4. Click **RUN**
5. Verify success (should see "Success. No rows returned")

---

### **Step 2: Verify CRON_SECRET Environment Variable**

The cron job requires authentication to prevent unauthorized access.

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `CRON_SECRET` exists
3. **If missing**, add it:
   - Name: `CRON_SECRET`
   - Value: Any random secure string (e.g., `partylab-cron-secret-2026`)
   - Environments: Production

4. **Redeploy** after adding the variable

---

## 📅 How the Reminder System Works

### **Timeline**:
- **Today**: Thursday, January 22
- **Cron runs**: Every day at 10:00 AM
- **Checks for**: Bookings happening **2 days from now** (48 hours)

### **When Reminders Are Sent**:
| Your Booking Date | Cron Will Check On | Reminder Sent On |
|-------------------|-------------------|------------------|
| Saturday, Jan 24  | Thursday, Jan 22  | Thursday, Jan 22 (today at 10 AM) |
| Saturday, Jan 25  | Friday, Jan 23    | Friday, Jan 23 at 10 AM |
| Sunday, Jan 26    | Friday, Jan 23    | Friday, Jan 23 at 10 AM |

**Important**: If you have bookings for **Saturday Jan 25**, the reminder will be sent **tomorrow (Friday)** at 10 AM.

---

## 📧 What Emails You'll Receive

When the cron runs, you'll get **2 emails** to `partylabaz@gmail.com`:

### **Email 1: Customer Reminder (To Forward)**
- Subject: `[FOR CUSTOMER] Reminder: [Customer Name]'s Party in 48 Hours! 🎉`
- Contains: Full customer-facing reminder with event details
- **Action**: Forward this email to the customer's email address

### **Email 2: Business Notification**
- Subject: `⏰ EVENT IN 48 HRS: [Customer Name] - [Date]`
- Contains: Internal details (arrival time, payment to collect, checklist)
- **Action**: For your records and preparation

---

## 🧪 How to Test Manually

If you want to test the reminder system right now (without waiting for tomorrow):

### **Option A: Test via Vercel Logs**

1. Go to Vercel → Your Project → Deployments → Latest Deployment
2. Click **Logs**
3. Look for messages like:
   ```
   [CRON] Checking for events on 2026-01-24
   [CRON] Found X booking(s) to remind
   ```

### **Option B: Manually Trigger the Cron**

You can manually call the cron endpoint to test it:

1. First, get your `CRON_SECRET` from Vercel environment variables
2. Use this curl command (replace `YOUR_CRON_SECRET`):

```bash
curl -X GET "https://partylabaz.com/api/cron/send-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

3. Check your email at partylabaz@gmail.com
4. Check the response:
   - Success: `{"message": "Reminder processing complete", "successful": X}`
   - Error: Check what went wrong

---

## 🔍 Checking Vercel Logs

To see if the cron is running and why it might be failing:

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by: **Functions** or search for `send-reminders`
3. Look for:
   - `[CRON] Checking for events on...` - Shows it's running
   - `[CRON] Found X booking(s) to remind` - Shows bookings found
   - `[CRON] Database error:` - Shows database issues
   - `Unauthorized` - Means CRON_SECRET is wrong/missing

---

## ⚠️ Why You Haven't Received Emails Yet

**Most likely reasons**:

1. ✅ **Database column missing** (confirmed - I just created the migration)
2. ❓ **CRON_SECRET not set** in Vercel (need to check)
3. ❓ **Bookings are for Jan 25** (would send tomorrow, not today)
4. ❓ **Cron hasn't run yet today** (runs at 10 AM)

**After you run the migration**, the system should work automatically going forward.

---

## 🛠️ Quick Fix Checklist

```
[ ] Run database migration SQL in Supabase
[ ] Verify reminder_sent_at column exists in bookings table
[ ] Check if CRON_SECRET exists in Vercel env vars
[ ] If missing, add CRON_SECRET and redeploy
[ ] Check Vercel logs to see if cron is running
[ ] Wait for tomorrow's cron run OR manually trigger test
[ ] Check partylabaz@gmail.com for test emails
```

---

## 🎯 Next Steps

### **For Your Saturday Bookings**:

**If bookings are for Saturday, Jan 24**:
- Cron should have run this morning at 10 AM
- But it failed because of missing column
- After you add the column, you can manually trigger it (see "Test Manually" section)

**If bookings are for Saturday, Jan 25**:
- Cron will run tomorrow (Friday, Jan 23) at 10 AM
- After you add the column today, it will work automatically tomorrow

### **Immediate Action**:
1. Run the database migration NOW (5 minutes)
2. Check Vercel for CRON_SECRET (2 minutes)
3. Manually trigger the cron to test (optional, 5 minutes)
4. Or just wait for tomorrow's automatic run

---

## 📞 If Still Not Working

After running the migration, if you still don't get emails:

1. Check Vercel logs for errors
2. Make sure bookings exist in database for the target date
3. Verify bookings have:
   - `booking_status` = "confirmed"
   - `payment_status` = "paid"
   - `reminder_sent_at` = NULL (or doesn't exist yet)

4. Manually trigger the cron and check the response
5. Check Resend logs: https://resend.com/logs

---

## 🔧 For Future Reference

### **To resend a reminder** (if needed):
```sql
UPDATE bookings
SET reminder_sent_at = NULL
WHERE id = 'your-booking-id';
```

Then wait for next cron run or manually trigger.

### **To check reminder status**:
```sql
SELECT
  id,
  customer_name,
  event_date,
  reminder_sent_at,
  CASE
    WHEN reminder_sent_at IS NULL THEN 'Not sent'
    ELSE 'Sent on ' || TO_CHAR(reminder_sent_at, 'Mon DD at HH:MI AM')
  END as status
FROM bookings
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;
```

---

**Files Created**:
- `database-migration-reminder-column.sql` - Run this in Supabase SQL Editor

**Last Updated**: January 22, 2026
**Priority**: 🔴 HIGH - Fix before Saturday events
