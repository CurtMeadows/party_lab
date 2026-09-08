"use client";

import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { ADD_ONS } from "@/lib/constants";
import type { AddOns } from "@/types/booking";

export function Screen4AddOns() {
  const { bookingData, updateAddOns, nextStep } = useBooking();

  const handleToggle = (addonId: string) => {
    updateAddOns({
      ...bookingData.addOns,
      [addonId]: !bookingData.addOns[addonId as keyof AddOns],
    });
  };

  const handleContinue = () => {
    nextStep();
  };

  const calculateAddOnsTotal = () => {
    return ADD_ONS.reduce((total, addon) => {
      return total + (bookingData.addOns[addon.id as keyof AddOns] ? addon.price : 0);
    }, 0);
  };

  // Filter add-ons based on selected package
  const getAvailableAddOns = () => {
    const selectedPackage = bookingData.package;

    return ADD_ONS.filter((addon) => {
      // These are included in Glow Getter & All-Star VIP
      if (addon.id === "discoBall" || addon.id === "redRopesCarpet" ||
          addon.id === "curatedPlaylist" || addon.id === "wirelessMicrophone" ||
          addon.id === "glowBags") {
        return selectedPackage === "Party Starter";
      }

      // Extra Hour: For Party Starter and Glow Getter only (All-Star VIP has extended hours)
      if (addon.id === "extraHour") {
        return selectedPackage === "Party Starter" || selectedPackage === "Glow Getter";
      }

      // Overnight Package: Only for Party Starter and Glow Getter (included in All-Star VIP)
      if (addon.id === "overnightPackage") {
        return selectedPackage === "Party Starter" || selectedPackage === "Glow Getter";
      }

      return true;
    });
  };

  const availableAddOns = getAvailableAddOns();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 text-glow-purple">
          Enhance Your Experience
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Add extras to make your party even more memorable
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {availableAddOns.length > 0 ? (
          availableAddOns.map((addon) => {
            const isSelected = bookingData.addOns[addon.id as keyof AddOns];

            return (
              <Card
                key={addon.id}
                onClick={() => handleToggle(addon.id)}
                className={`p-6 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-primary bg-primary/5 glow-purple"
                    : "border-border hover:border-primary"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{addon.name}</h3>
                      <span className="text-2xl font-bold text-primary">
                        +${addon.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{addon.description}</p>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              All add-ons are already included in your {bookingData.package} package!
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <Card className="max-w-md mx-auto p-6 bg-card border-primary">
        <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Package</span>
            <span className="font-semibold">{bookingData.package}</span>
          </div>
          {calculateAddOnsTotal() > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Add-ons</span>
              <span className="font-semibold">+${calculateAddOnsTotal()}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold text-primary">
                ${bookingData.pricing.subtotal}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            * $100 deposit will be charged now. Remaining balance due on event date.
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleContinue}
          size="lg"
          className="gradient-purple-pink glow-purple text-white font-semibold px-12"
        >
          Continue to Customer Info →
        </Button>
      </div>
    </div>
  );
}
