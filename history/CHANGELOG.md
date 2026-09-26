# Changelog

Every change to the site, newest first. Generated from git history.
To refresh: `bash history/update-changelog.sh`

## September 2026

- **2026-09-08** — Fall back to city/state when full address fails to geocode
- **2026-09-08** — Wire banner's "book your party" link to open the booking modal
- **2026-09-08** — Open bookings immediately instead of waiting for Oct 17
- **2026-09-08** — Reposition as East Valley-based with statewide bookings accepted
- **2026-09-08** — Fix false "Previous Steps Required" warning on every booking
- **2026-09-08** — Route customer confirmation email to business inbox for manual forwarding
- **2026-09-08** — Add migration for 4 missing addon columns on bookings table
- **2026-09-08** — Fail closed on cron reminder endpoint if CRON_SECRET is unset
- **2026-09-08** — Fix seasonal-gate dates to use explicit Arizona timezone offset
- **2026-09-08** — Fix E2E suite: mock clock past reopen date, fix ambiguous locator
- **2026-09-08** — Remove Themed Video Projector add-on
- **2026-09-08** — Reopen for Oct 17 season: banner copy + fix hardcoded Oct 1 booking gate

## April 2026

- **2026-04-17** — Match footer IG/FB icons to hero — brand colors, shadow, hover scale
- **2026-04-17** — Fix spacing on desktop — FAQ and contact form sections tightened
- **2026-04-17** — Reduce dead space between all sections
- **2026-04-17** — Make View Pricing and Talk to Us First buttons more clickable
- **2026-04-17** — Make IG and FB icons pop with brand colors and larger size
- **2026-04-17** — Redesign hero CTAs as 3 tabs: View Pricing, Talk to Us First, Book Now
- **2026-04-15** — Remove package selection from Build Your Party section — Build Your Own only
- **2026-04-15** — Remove package references from Build Your Party section
- **2026-04-15** — Fix Dance Dome pricing: $400 → $450
- **2026-04-15** — Update pricing and remove packages from booking experience
- **2026-04-13** — Add contact link under summer closure notice in date picker
- **2026-04-13** — Fix Stripe redirect booking loss and email deliverability
- **2026-04-06** — Block May 2 - Sep 30 dates in calendar picker
- **2026-04-06** — Always default experience screen to Build Your Own
- **2026-04-06** — Show playlist question only when curated playlist is selected
- **2026-04-06** — Update surface type options with specific surfaces
- **2026-04-06** — Default to Build Your Own and show all add-ons upfront
- **2026-04-06** — Make announcement banner permanent and mobile-friendly
- **2026-04-06** — Block bookings May 2 - Sep 30 with summer closure screen
- **2026-04-06** — Add summer closure announcement banner

## March 2026

- **2026-03-17** — Add separate Google and Facebook review buttons
- **2026-03-17** — Enhances env var management and validation
- **2026-03-16** — Fix TypeScript errors - update addon field names
- **2026-03-16** — Fix Vercel deployment - add Node.js version requirement
- **2026-03-16** — Remove turbopack flag from build command
- **2026-03-16** — Revert vercel.json and force clean rebuild
- **2026-03-16** — Update vercel.json to force fresh build
- **2026-03-16** — Force rebuild for reviews section updates
- **2026-03-16** — Force rebuild - clear Vercel cache for capacity fix
- **2026-03-16** — Update Google review link to correct URL
- **2026-03-16** — Update Google review with actual review from Leeann Garcia
- **2026-03-16** — Add reviews carousel with Google/Facebook source indicators
- **2026-03-16** — Update Light Haus and Club Noir capacity to 15-30 guests
- **2026-03-16** — Update booking flow and travel surcharge system
- **2026-03-08** — Change Wireless Microphones to Wireless Microphone (singular)

## February 2026

- **2026-02-24** — Improve SEO for better Google search visibility
- **2026-02-22** — Make Ready to Party section more compact
- **2026-02-22** — Move reviews section above FAQ
- **2026-02-22** — Add 2 new Facebook reviews to website
- **2026-02-16** — Add "How did you hear about us?" field to booking flow
- **2026-02-16** — Add customer info section to confirmation emails
- **2026-02-16** — Add Themed Video Projector add-on to confirmation emails
- **2026-02-16** — Move Leave a Review button to top, mention Facebook
- **2026-02-16** — Replace star ratings with Verified Customer badge
- **2026-02-16** — Add first customer review - Samantha B.
- **2026-02-16** — Try direct Facebook reviews URL
- **2026-02-16** — Update Facebook link to main page
- **2026-02-16** — Fix Facebook review link URL format
- **2026-02-16** — Update reviews section with proper heading and tagline
- **2026-02-16** — Remove placeholder reviews, simplify to CTA only
- **2026-02-16** — Add Reviews Section with Facebook integration
- **2026-02-13** — Remove extra sentence from FAQ rental extension answer
- **2026-02-13** — Update Glow Up Kit to Glow Up Party Bags (15 guests)

## January 2026

- **2026-01-23** — Remove confusing 'Unavailable Time Blocks' section
- **2026-01-23** — Fix: Handle corrupted/incomplete localStorage booking data
- **2026-01-23** — Add Themed Video Projector as $100 add-on + Update All-Star VIP package
- **2026-01-21** — Update base location to Downtown Tempe + Fix TypeScript test issues
- **2026-01-21** — 🚨 Critical Fix: Prevent double bookings + Add trip charge + Extra hours features
- **2026-01-17** — Update hero badge tagline to emphasize broader event types
- **2026-01-17** — Convert all times to 12-hour format throughout booking flow
- **2026-01-16** — Implement custom time block selection with validation
- **2026-01-16** — Reposition 48-hour contact notice and increase font size
- **2026-01-16** — Update booking page: compact 48-hour contact notice and daylight warning
- **2026-01-10** — CRITICAL FIX: Ensure partylabaz@gmail.com always gets booking notifications
- **2026-01-10** — Add automated 48-hour event reminder system (manual forwarding)
- **2026-01-10** — Fix date display timezone issues in confirmation page and emails
- **2026-01-07** — Remove Daylight Dance package
- **2026-01-07** — Update daylight package badge text
- **2026-01-07** — Update package display and daylight booking experience
- **2026-01-07** — Fix availability check to respect blocked time slots
- **2026-01-07** — Simplify UI and add Talk to Us First feature
- **2026-01-06** — Switch from Web3Forms to Resend for email delivery
- **2026-01-06** — Add development tools and helper scripts
- **2026-01-06** — Ensure customer email is always included with payments
- **2026-01-06** — Add contact fallback message to payment errors
- **2026-01-06** — CRITICAL: Prevent double-charging customers
- **2026-01-06** — Fix add-ons step showing checkmark prematurely
- **2026-01-06** — SECURITY: Restore service role client with proper env var
- **2026-01-05** — CRITICAL: Fix booking creation to use anon client
- **2026-01-05** — Revert availability check to use anon client
- **2026-01-05** — Fix availability check to use service role client
- **2026-01-03** — Fix critical bug: Booking creation failing after payment
- **2026-01-03** — Update package-lock.json for Playwright dependencies
- **2026-01-03** — Add comprehensive E2E tests for booking flow
- **2026-01-03** — Fix critical booking bugs: date display and pricing calculation

## December 2025

- **2025-12-23** — Add Google Analytics tracking
- **2025-12-21** — Add business notification email for new bookings
- **2025-12-19** — Enable free navigation in booking flow with smart completion tracking
- **2025-12-18** — Fix package selection highlighting in booking flow
- **2025-12-18** — Comprehensive mobile payment experience enhancements
- **2025-12-18** — Add ACH Direct Debit and Cash App Pay payment options
- **2025-12-18** — Reorganize pre-event checklist with surface questions
- **2025-12-18** — Fix custom time persistence in booking flow
- **2025-12-18** — Improve booking flow UX and fix time display
- **2025-12-18** — Add Community Events and School Events + strengthen SEO
- **2025-12-18** — Remove duplicate 'Still have questions?' section from FAQ
- **2025-12-18** — Add 'Call or Text' label to footer contact section
- **2025-12-18** — Update phone number labels to indicate call or text option
- **2025-12-18** — Fix Dance Dome pricing in booking modal
- **2025-12-18** — Update social proof section text to highlight local start-up story
- **2025-12-18** — Add contact form with message field
- **2025-12-18** — Enable Sunday bookings and adjust weekday time slots
- **2025-12-18** — Add conditional add-ons, red ropes & carpet, and pre-event readiness checklist

## November 2025

- **2025-11-26** — Add availability override system for manual date blocking
- **2025-11-26** — Add complete self-booking system with Stripe and Supabase
- **2025-11-26** — Trigger Vercel deployment
- **2025-11-26** — Add dimensions display to product cards
- **2025-11-26** — Fix TypeScript build errors and update documentation
- **2025-11-16** — Update faq-section.tsx
- **2025-11-16** — Update product-selector.tsx
- **2025-11-03** — Update faq-section.tsx
- **2025-11-03** — Update packages-section.tsx
- **2025-11-01** — Update hero-section.tsx

## October 2025

- **2025-10-31** — Removes Add-Ons component
- **2025-10-28** — Update packages-section.tsx
- **2025-10-28** — Removes unused AddOns import
- **2025-10-28** — Closes the packages section
- **2025-10-24** — Update page.tsx
- **2025-10-24** — Create product-selector.tsx
- **2025-10-24** — Update package-card.tsx
- **2025-10-24** — Update page.tsx
- **2025-10-24** — Create packages-section.tsx
- **2025-10-23** — Update page.tsx
- **2025-10-23** — Update page.tsx
- **2025-10-23** — Removes CSS optimization flag
- **2025-10-23** — Improves performance and SEO
- **2025-10-23** — Enhances hero section and image loading
- **2025-10-23** — Renames "PartyLabAZ" to "The Partylab"
- **2025-10-20** — Initializes website with core SEO features

## September 2025

- **2025-09-19** — Initial commit from Create Next App
