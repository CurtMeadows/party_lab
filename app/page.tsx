"use client";

import { useState, useEffect } from "react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { HeroSection } from "@/components/hero-section";
import { PackagesSection } from "@/components/packages-section";
import { ContactForm } from "@/components/contact-form";
import { FAQSection } from "@/components/faq-section";
import { BookingModal } from "@/components/booking/booking-modal";
import { Instagram, Mail, Phone, CheckCircle2, AlertTriangle } from "lucide-react";
import { ReviewsSection } from "@/components/reviews-section";
import Image from "next/image";
import type { InitialBookingData } from "@/types/booking";
import { createBooking } from "@/app/actions/create-booking";
import { sendConfirmationEmail } from "@/app/actions/send-confirmation-email";

export default function Home() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingData, setInitialBookingData] = useState<InitialBookingData | undefined>(undefined);
  const [stripeReturnStatus, setStripeReturnStatus] = useState<"processing" | "success" | "error" | null>(null);

  // Handle Stripe redirect returns (3D Secure, Apple Pay, etc.)
  // When payment requires a redirect, Stripe returns here with payment_intent params in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const redirectStatus = params.get("redirect_status");

    if (!paymentIntentId || redirectStatus !== "succeeded") return;

    // Clean up URL immediately
    window.history.replaceState({}, "", "/");
    setStripeReturnStatus("processing");

    const savedData = localStorage.getItem("partylab_booking");
    if (!savedData) {
      setStripeReturnStatus("error");
      return;
    }

    const bookingData = JSON.parse(savedData);

    (async () => {
      try {
        const result = await createBooking(bookingData, paymentIntentId);
        if (!result.success) {
          setStripeReturnStatus("error");
          return;
        }
        await sendConfirmationEmail(bookingData, result.bookingId!);
        localStorage.removeItem("partylab_booking");
        setStripeReturnStatus("success");
      } catch {
        setStripeReturnStatus("error");
      }
    })();
  }, []);

  const handleBookNowClick = (initialData?: InitialBookingData) => {
    setInitialBookingData(initialData);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setInitialBookingData(undefined);
  };

  return (
    <main className="min-h-screen">
      {/* Seasonal Announcement Banner */}
      <AnnouncementBanner />

      {/* Stripe redirect return status */}
      {stripeReturnStatus === "processing" && (
        <div className="w-full bg-primary/20 border-b border-primary/40 px-4 py-3 text-center text-sm text-white">
          Completing your booking, please wait...
        </div>
      )}
      {stripeReturnStatus === "success" && (
        <div className="w-full px-4 py-4 text-center" style={{ background: "linear-gradient(135deg, #14532d, #15803d)" }}>
          <div className="flex items-center justify-center gap-2 text-white font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Your booking is confirmed! A confirmation email is on its way.
          </div>
        </div>
      )}
      {stripeReturnStatus === "error" && (
        <div className="w-full px-4 py-4 text-center bg-destructive/20 border-b border-destructive/40">
          <div className="flex items-center justify-center gap-2 text-white font-semibold">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Your payment was received but we had trouble saving your booking. Please call/text us at (602) 799-5856 right away.
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseModal}
        initialData={initialBookingData}
      />

      {/* Hero Section */}
      <HeroSection onBookNowClick={() => handleBookNowClick()} />

      {/* Packages Section */}
      <PackagesSection onBookNowClick={handleBookNowClick} />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Photo Gallery Section - Hidden for now */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-glow-teal">
              See the Magic
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check out some amazing moments from our inflatable nightclub events
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
              "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
              "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
              "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
              "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
            ].map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact Form */}
      <ContactForm />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Image
                  src="/logo-small.png"
                  alt="The Partylab"
                  width={128}
                  height={128}
                  className="w-32 h-32"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">
                Contact Us
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Call or Text</p>
                    <a
                      href="tel:+16027995856"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      (602) 799-5856
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href="mailto:partylabaz@gmail.com"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      partylabaz@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-foreground">
                Follow Us
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/partylabaz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)" }}
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://www.facebook.com/people/Partylabaz/61579352249971"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center transition-all hover:scale-110 hover:bg-[#0d6edb] shadow-lg"
                  aria-label="Follow us on Facebook"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} The Partylab. All rights reserved. Proudly based in the East Valley, serving all of Arizona.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
