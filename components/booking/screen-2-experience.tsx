"use client";

import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { ADD_ONS, getBasePrice as getProductBasePrice } from "@/lib/constants";
import type { AddOns } from "@/types/booking";

export function Screen2Experience() {
  const { bookingData, updatePackage, updateAddOns, nextStep } = useBooking();

  // Get product-specific base price
  const getBasePrice = (): number => {
    return getProductBasePrice(bookingData.product);
  };

  // Calculate total from base + add-ons
  const getTotal = (): number => {
    let total = getBasePrice();
    ADD_ONS.forEach(addOn => {
      if (bookingData.addOns[addOn.id as keyof AddOns]) {
        total += addOn.price;
      }
    });
    return total;
  };

  const toggleAddOn = (addonId: string) => {
    updateAddOns({
      ...bookingData.addOns,
      [addonId]: !bookingData.addOns[addonId as keyof AddOns],
    });
  };

  const handleContinue = () => {
    const price = getTotal();
    updatePackage("Party Starter", price);
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-glow-pink">
          Customize Your Experience
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Starting at ${getBasePrice()} — add extras to make it your own
        </p>

        {bookingData.product && (
          <p className="text-sm text-muted-foreground mt-2">
            Venue: <span className="text-primary font-semibold">{bookingData.product}</span>
          </p>
        )}
      </div>

      {/* Add-Ons Grid */}
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {ADD_ONS.map((addOn) => {
            const isSelected = bookingData.addOns[addOn.id as keyof AddOns];
            return (
              <button
                key={addOn.id}
                onClick={() => toggleAddOn(addOn.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/10 glow-purple"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-semibold leading-tight">{addOn.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="text-base sm:text-lg font-bold text-primary">+${addOn.price}</div>
              </button>
            );
          })}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Base includes LED lighting, Bluetooth speakers, 3-hour rental, setup & teardown
        </p>
      </div>

      {/* Price Summary & Continue Button */}
      <div className="max-w-md mx-auto">
        <div className="bg-card border-2 border-primary rounded-xl p-4 sm:p-5 glow-purple">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-glow-pink">
                  ${getTotal()}
                </span>
              </div>
            </div>
            <Button
              onClick={handleContinue}
              size="lg"
              className="text-base sm:text-lg px-6 py-5 gradient-purple-pink hover:opacity-90 hover:scale-105 transition-all glow-purple text-white font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
