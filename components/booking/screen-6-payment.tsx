"use client";

import { useState, useEffect } from "react";
import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { createPaymentIntent } from "@/app/actions/create-payment-intent";
import { createBooking } from "@/app/actions/create-booking";
import { sendConfirmationEmail } from "@/app/actions/send-confirmation-email";
import { Loader2, CreditCard, Shield, Lock, ChevronDown, ChevronUp, CheckCircle2, Smartphone, Wallet } from "lucide-react";
import { format } from "date-fns";
import type { PaymentRequest } from "@stripe/stripe-js";
import { formatTime12Hour } from "@/lib/format-time";

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { bookingData, updateBookingId, nextStep } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    if (stripe && bookingData.pricing.bookingFee) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Deposit",
          amount: Math.round(bookingData.pricing.bookingFee * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if Payment Request is available (Apple Pay, Google Pay, etc.)
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });

      pr.on("paymentmethod", async (ev) => {
        if (!bookingData.paymentIntentId) {
          ev.complete("fail");
          return;
        }

        // Confirm the payment with the payment method from the wallet
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          bookingData.paymentIntentId,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete("fail");
          setErrorMessage(confirmError.message || "Payment failed");
          return;
        }

        ev.complete("success");

        if (paymentIntent && paymentIntent.status === "succeeded") {
          // Create booking in database
          const bookingResult = await createBooking(bookingData, paymentIntent.id);

          if (!bookingResult.success) {
            setErrorMessage("⚠️ Your payment was received but we had trouble saving your booking. Please call or text us at (602) 799-5856 right away and we will get you sorted out.");
            return;
          }

          // Send confirmation email
          await sendConfirmationEmail(bookingData, bookingResult.bookingId!);

          // Update booking ID and go to confirmation screen
          updateBookingId(bookingResult.bookingId!, paymentIntent.id);
          nextStep();
        }
      });
    }
  }, [stripe, bookingData.pricing.bookingFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !bookingData.paymentIntentId) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setErrorMessage(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Create booking in database
        const bookingResult = await createBooking(bookingData, paymentIntent.id);

        if (!bookingResult.success) {
          setErrorMessage("⚠️ Your payment was received but we had trouble saving your booking. Please call or text us at (602) 799-5856 right away and we will get you sorted out.");
          setIsProcessing(false);
          return;
        }

        // Send confirmation email
        await sendConfirmationEmail(bookingData, bookingResult.bookingId!);

        // Update booking ID and go to confirmation screen
        updateBookingId(bookingResult.bookingId!, paymentIntent.id);
        nextStep();
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg sm:text-xl font-bold">Payment Details</h3>
        </div>

        {/* Payment Method Icons - Mobile */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border sm:hidden">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="w-4 h-4" />
            <span>Accepts:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Cards</span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Apple Pay</span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Cash App</span>
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Bank</span>
          </div>
        </div>

        {/* Apple Pay / Google Pay Button */}
        {paymentRequest && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Quick Pay</span>
            </div>
            <PaymentRequestButtonElement options={{ paymentRequest }} />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or choose another method</span>
              </div>
            </div>
          </div>
        )}

        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true,
            },
          }}
        />

        {/* Security Indicators */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-start gap-3 text-sm">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-500 flex items-center gap-2">
                Secure Payment
                <Lock className="w-3 h-3" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment information is encrypted and secure. Powered by Stripe.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg space-y-2">
          <p className="text-destructive text-sm font-semibold">{errorMessage}</p>
          <p className="text-sm text-foreground">
            Having trouble? <strong>Call or text us to complete your booking:</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <a
              href="tel:6027995856"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium"
            >
              📞 Call (602) 799-5856
            </a>
            <a
              href="sms:6027995856"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium"
            >
              💬 Text (602) 799-5856
            </a>
          </div>
        </div>
      )}

      {/* Sticky payment button on mobile */}
      <div className="lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:bg-transparent lg:p-0 lg:border-none
                      fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t border-border z-10
                      lg:z-auto">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          size="lg"
          className="w-full gradient-purple-pink glow-purple text-white font-semibold text-base sm:text-lg py-6 sm:py-8 lg:py-6
                     shadow-lg lg:shadow-none"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Pay ${bookingData.pricing.bookingFee} Securely</span>
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-2 lg:mt-3">
          Remaining balance of ${bookingData.pricing.total - bookingData.pricing.bookingFee} due on event date
        </p>
      </div>

      {/* Spacer for sticky button on mobile */}
      <div className="h-24 lg:hidden" />
    </form>
  );
}

export function Screen6Payment() {
  const { bookingData, updateBookingId } = useBooking();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts (only if one doesn't exist)
    const initializePayment = async () => {
      // If we already have a payment intent AND client secret, reuse them
      if (bookingData.paymentIntentId && bookingData.clientSecret) {
        setClientSecret(bookingData.clientSecret);
        setIsLoading(false);
        return;
      }

      // Create new payment intent (only if we don't have one)
      if (!bookingData.paymentIntentId) {
        const result = await createPaymentIntent(
          bookingData.pricing.bookingFee,
          bookingData.customer?.email,
          bookingData.customer?.name
        );

        if (result.success && result.clientSecret && result.paymentIntentId) {
          setClientSecret(result.clientSecret);
          updateBookingId("", result.paymentIntentId, result.clientSecret);
        }
      }

      setIsLoading(false);
    };

    initializePayment();
  }, []);

  if (!bookingData.customer || !bookingData.date || !bookingData.timeBlock || !bookingData.package) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg text-muted-foreground">
          Your booking session has expired or is incomplete.
        </p>
        <Button
          onClick={() => {
            localStorage.removeItem("partylab_booking");
            window.location.reload();
          }}
          className="gradient-purple-pink text-white"
        >
          Start New Booking
        </Button>
      </div>
    );
  }

  // Parse date as local timezone to avoid off-by-one errors
  const [year, month, day] = bookingData.date.split('-').map(Number);
  const formattedDate = format(new Date(year, month - 1, day), "MMMM d, yyyy");
  const [startTime, endTime] = bookingData.timeBlock.split("-");

  // Format times in 12-hour format
  const formattedStartTime = formatTime12Hour(startTime);
  const formattedEndTime = formatTime12Hour(endTime);

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 lg:pb-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-green-500" />
          <h2 className="text-3xl sm:text-4xl font-bold text-glow-purple">
            Secure Payment
          </h2>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete your booking with a secure $100 deposit
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL encryption • Powered by Stripe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {/* Booking Summary - Sticky on desktop, collapsible on mobile */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {/* Mobile: Collapsible Summary with Total First */}
          <Card className="p-4 sm:p-6 lg:h-fit">
            {/* Mobile Header - Collapsible */}
            <button
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              className="w-full flex items-center justify-between lg:cursor-default"
              type="button"
            >
              <h3 className="text-lg sm:text-xl font-bold">Booking Summary</h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform lg:hidden ${isSummaryCollapsed ? '' : 'rotate-180'}`}
              />
            </button>

            {/* Mobile: Show Total First (Always Visible) */}
            <div className="mt-4 lg:hidden">
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">${bookingData.pricing.total}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                ${bookingData.pricing.bookingFee} due now • ${bookingData.pricing.total - bookingData.pricing.bookingFee} due on event date
              </p>
            </div>

            {/* Collapsible Details */}
            <div className={`space-y-4 text-sm ${isSummaryCollapsed ? 'hidden' : 'mt-6'} lg:block lg:mt-6`}>
            <div>
              <div className="text-muted-foreground mb-1">Product</div>
              <div className="font-semibold">{bookingData.product}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Package</div>
              <div className="font-semibold">{bookingData.package}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Date & Time</div>
              <div className="font-semibold">{formattedDate}</div>
              <div className="text-muted-foreground text-xs">{formattedStartTime} - {formattedEndTime}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Location</div>
              <div className="font-semibold">{bookingData.customer.address}</div>
            </div>
            {bookingData.pricing.extraHours > 0 && (
              <div>
                <div className="text-muted-foreground mb-1">Extra Hours</div>
                <div className="text-xs">
                  {bookingData.pricing.extraHours} {bookingData.pricing.extraHours === 1 ? 'hour' : 'hours'} beyond included 3 hours (+${bookingData.pricing.extraHoursCost})
                </div>
              </div>
            )}
            {(bookingData.addOns.discoBall || bookingData.addOns.redRopesCarpet || bookingData.addOns.curatedPlaylist || bookingData.addOns.wirelessMicrophone || bookingData.addOns.glowBags || bookingData.addOns.extraHour || bookingData.addOns.overnightPackage) && (
              <div>
                <div className="text-muted-foreground mb-1">Add-Ons</div>
                <ul className="space-y-1">
                  {bookingData.addOns.discoBall && (
                    <li className="text-xs">• Disco Ball (+$30)</li>
                  )}
                  {bookingData.addOns.redRopesCarpet && (
                    <li className="text-xs">• Red Ropes & Carpet (+$75)</li>
                  )}
                  {bookingData.addOns.curatedPlaylist && (
                    <li className="text-xs">• Curated Playlist (+$50)</li>
                  )}
                  {bookingData.addOns.wirelessMicrophone && (
                    <li className="text-xs">• Wireless Microphone (+$50)</li>
                  )}
                  {bookingData.addOns.glowBags && (
                    <li className="text-xs">• Glow-Up Party Bags (+$50)</li>
                  )}
                  {bookingData.addOns.extraHour && (
                    <li className="text-xs">• Extra Hour (+$50)</li>
                  )}
                  {bookingData.addOns.overnightPackage && (
                    <li className="text-xs">• Overnight Package (+$150)</li>
                  )}
                </ul>
              </div>
            )}
            {/* Desktop: Traditional Total Section */}
            <div className="border-t border-border pt-4 hidden lg:block">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-semibold">${bookingData.pricing.subtotal}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Deposit (Due Now)</span>
                <span className="font-semibold text-primary">${bookingData.pricing.bookingFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">${bookingData.pricing.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Remaining balance of ${bookingData.pricing.total - bookingData.pricing.bookingFee} due on event date
              </p>
            </div>

            {/* Mobile: Pricing Breakdown (in collapsible) */}
            <div className="border-t border-border pt-4 lg:hidden">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${bookingData.pricing.subtotal}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Due Now</span>
                  <span className="font-semibold">${bookingData.pricing.bookingFee}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        </div>

        {/* Payment Form */}
        <div>
          {isLoading ? (
            <Card className="p-8 flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </Card>
          ) : clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#8B5CF6",
                    colorBackground: "#0a0a0a",
                    colorText: "#ffffff",
                    colorDanger: "#ef4444",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentForm />
            </Elements>
          ) : (
            <Card className="p-8 text-center text-destructive">
              Failed to initialize payment. Please try again.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
