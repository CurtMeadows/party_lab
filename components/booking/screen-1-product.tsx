"use client";

import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Users, Maximize2 } from "lucide-react";
import { PRODUCTS, getBasePrice as getProductBasePrice } from "@/lib/constants";
import type { ProductType } from "@/types/booking";

export function Screen1Product() {
  const { bookingData, updateProduct, nextStep } = useBooking();

  const handleSelect = (productName: ProductType) => {
    updateProduct(productName);
  };

  const handleContinue = () => {
    if (bookingData.product) {
      nextStep();
    }
  };

  // Get base price for each product
  const getBasePrice = (productName: string): number => {
    return getProductBasePrice(productName);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-glow-pink">
          Choose Your Venue
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the perfect inflatable nightclub for your event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {PRODUCTS.map((product) => {
          const isSelected = bookingData.product === product.name;
          const basePrice = getBasePrice(product.name);

          return (
            <button
              key={product.name}
              onClick={() => handleSelect(product.name)}
              className={`rounded-2xl border-2 overflow-hidden transition-all p-4 sm:p-6 text-left ${
                isSelected
                  ? "border-primary bg-primary/10 glow-purple"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden mb-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3">{product.description}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-3">Starting at ${basePrice}</p>
                <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity: {product.capacity}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" />
                    Size: {product.dimensions}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleContinue}
          disabled={!bookingData.product}
          size="lg"
          className="gradient-purple-pink glow-purple text-white font-semibold px-12"
        >
          Continue to Experience →
        </Button>
      </div>
    </div>
  );
}
