"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sun, Mail } from "lucide-react";
import { BookingProvider, useBooking } from "./booking-context";
import { ProgressIndicator } from "./progress-indicator";
import { Button } from "@/components/ui/button";
import type { InitialBookingData } from "@/types/booking";

// Seasonal closure lifted early per owner request (customers emailing to book
// future events) — reopened effective 2026-09-08, ahead of the original Oct 17
// target. isSeasonallyClosed() is kept (rather than deleted) so the same
// mechanism can be reused for next summer's closure.
const CLOSE_DATE = new Date("2026-05-02T00:00:00-07:00");
const REOPEN_DATE = new Date("2026-09-08T00:00:00-07:00");
const isSeasonallyClosed = () => {
  const now = new Date();
  return now >= CLOSE_DATE && now < REOPEN_DATE;
};

// Import screens - New flow: Venue → Experience → Date → Info → Payment → Done
import { Screen1Product } from "./screen-1-product";
import { Screen2Experience } from "./screen-2-experience";
import { Screen2DateTime } from "./screen-2-datetime";
import { Screen5Customer } from "./screen-5-customer";
import { Screen6Payment } from "./screen-6-payment";
import { Screen7Confirmation } from "./screen-7-confirmation";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InitialBookingData;
}

function SeasonalClosureScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-background rounded-lg shadow-2xl overflow-hidden border-2 border-amber-500/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card border border-border hover:border-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sunset header bar */}
        <div
          className="w-full h-2"
          style={{ background: "linear-gradient(90deg, #b45309, #f59e0b, #ef4444)" }}
        />

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
              <Sun className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              We&apos;re Closed for the Summer
            </h2>
            <p className="text-amber-500 font-semibold text-sm">
              Closed May 2 – October 16, 2026
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Due to the Arizona summer heat, we are not accepting new bookings at this time.
            We&apos;ll be back and ready to party when the weather cools down in October!
          </p>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Interested in a fall or winter booking?
            </p>
            <p className="text-sm text-muted-foreground">
              Reach out and we&apos;ll get you on the calendar for when we reopen.
            </p>
            <a
              href="mailto:partylabaz@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #b45309, #ef4444)" }}
            >
              <Mail className="w-4 h-4" />
              partylabaz@gmail.com
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            Thank you so much for your support during our first year. We can&apos;t wait to celebrate with you this fall! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

function BookingModalContent({ onClose }: { onClose: () => void }) {
  const { bookingData, prevStep, goToStep, isStepCompleted } = useBooking();
  const { currentStep } = bookingData;
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  // New flow: 1-Venue, 2-Experience, 3-Date, 4-Info, 5-Payment, 6-Done
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Screen1Product />;
      case 2:
        return <Screen2Experience />;
      case 3:
        return <Screen2DateTime />;
      case 4:
        return <Screen5Customer />;
      case 5:
        return <Screen6Payment />;
      case 6:
        return <Screen7Confirmation onClose={onClose} />;
      default:
        return <Screen1Product />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden border-2 border-primary glow-purple">
        {/* Close button */}
        {currentStep !== 6 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all"
            aria-label="Close booking"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div ref={contentRef} className="overflow-y-auto max-h-[90vh] p-6 sm:p-8">
          {/* Progress indicator */}
          {currentStep !== 6 && (
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={6}
              onStepClick={goToStep}
              isStepCompleted={isStepCompleted}
            />
          )}

          {/* Step content */}
          <div className="mt-6">{renderStep()}</div>

          {/* Back button (not on first or last step) */}
          {currentStep > 1 && currentStep < 6 && (
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                className="w-full sm:w-auto"
              >
                ← Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BookingModal({ isOpen, onClose, initialData }: BookingModalProps) {
  if (!isOpen) return null;

  if (isSeasonallyClosed()) {
    return <SeasonalClosureScreen onClose={onClose} />;
  }

  return (
    <BookingProvider initialData={initialData}>
      <BookingModalContent onClose={onClose} />
    </BookingProvider>
  );
}
