"use client";

import { useState } from "react";
import { ProductSelector } from "./product-selector";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { ADD_ONS, getBasePrice as getProductBasePrice } from "@/lib/constants";
import type { InitialBookingData, ProductType } from "@/types/booking";

interface PackagesSectionProps {
  onBookNowClick?: (initialData?: InitialBookingData) => void;
}

export function PackagesSection({ onBookNowClick }: PackagesSectionProps = {}) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const getBasePrice = () => {
    return getProductBasePrice(selectedProduct);
  };

  const getTotal = () => {
    let total = getBasePrice();
    selectedAddOns.forEach(addOnId => {
      const addOn = ADD_ONS.find(a => a.id === addOnId);
      if (addOn) total += addOn.price;
    });
    return total;
  };

  const toggleAddOn = (id: string) => {
    const newSet = new Set(selectedAddOns);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAddOns(newSet);
  };

  return (
    <section id="packages" className="pt-6 pb-8 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-glow-pink">
            Build Your Party
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Choose your venue, then customize with add-ons
          </p>
        </div>

        {/* Choose Venue */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-glow-purple">
            Choose Your Venue
          </h3>
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductSelect={setSelectedProduct}
            compact={true}
          />
        </div>

        {/* Add-Ons */}
        {selectedProduct && (
          <div className="animate-fade-in">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-glow-purple">
              Customize Your Experience
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {ADD_ONS.map((addOn) => (
                  <button
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedAddOns.has(addOn.id)
                        ? "border-primary bg-primary/10 glow-purple"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-semibold leading-tight">{addOn.name}</span>
                      {selectedAddOns.has(addOn.id) && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-primary">+${addOn.price}</div>
                  </button>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Base includes LED lighting, Bluetooth speakers, 3-hour rental, setup & teardown
              </p>
            </div>
          </div>
        )}

        {/* Price Summary & Book Button */}
        {selectedProduct && (
          <div className="mt-8 sticky bottom-4 z-10 animate-fade-in">
            <div className="bg-card border-2 border-primary rounded-xl p-4 sm:p-5 shadow-xl glow-purple">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-glow-pink">
                      ${getTotal()}
                    </span>
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {selectedProduct}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (onBookNowClick && selectedProduct) {
                      const initialData: InitialBookingData = {
                        product: selectedProduct as ProductType,
                        buildMode: "custom",
                        package: null,
                        selectedAddOns: Array.from(selectedAddOns),
                        totalPrice: getTotal(),
                      };
                      onBookNowClick(initialData);
                    }
                  }}
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 gradient-purple-pink hover:opacity-90 hover:scale-105 transition-all glow-purple text-white font-semibold shadow-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Request to Book
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt to select product */}
        {!selectedProduct && (
          <p className="text-center text-sm sm:text-base text-muted-foreground py-6">
            Select a venue above to see pricing and customize your party
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            All rentals include setup & teardown. Serving Phoenix metro & all of Arizona.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            LED lights have limited visibility in daylight.
          </p>
        </div>
      </div>
    </section>
  );
}
