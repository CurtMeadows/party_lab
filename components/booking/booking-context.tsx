"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { BookingData, AddOns, CustomerInfo, Pricing, InitialBookingData } from "@/types/booking";
import { BOOKING_FEE, ADD_ONS } from "@/lib/constants";

interface BookingContextType {
  bookingData: BookingData;
  updateProduct: (product: BookingData["product"]) => void;
  updateDateTime: (date: string, timeBlock: BookingData["timeBlock"], extraHours?: number) => void;
  updatePackage: (pkg: BookingData["package"], price: number) => void;
  updateAddOns: (addOns: AddOns) => void;
  updateCustomer: (customer: CustomerInfo) => void;
  updateTripCharge: (tripCharge: number) => void;
  updateBookingId: (bookingId: string, paymentIntentId: string, clientSecret?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetBooking: () => void;
  isStepCompleted: (step: number) => boolean;
  arePreviousStepsCompleted: (step: number) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialAddOns: AddOns = {
  discoBall: false,
  redRopesCarpet: false,
  curatedPlaylist: false,
  wirelessMicrophone: false,
  glowBags: false,
  extraHour: false,
  overnightPackage: false,
};

const initialPricing: Pricing = {
  subtotal: 0,
  bookingFee: BOOKING_FEE,
  extraHours: 0,
  extraHoursCost: 0,
  tripCharge: 0,
  total: BOOKING_FEE,
};

const initialBookingData: BookingData = {
  currentStep: 1,
  product: null,
  date: null,
  timeBlock: null,
  package: null,
  addOns: initialAddOns,
  customer: null,
  pricing: initialPricing,
  bookingId: null,
  paymentIntentId: null,
  clientSecret: null,
};

interface BookingProviderProps {
  children: React.ReactNode;
  initialData?: InitialBookingData;
}

export function BookingProvider({ children, initialData }: BookingProviderProps) {
  const [bookingData, setBookingData] = useState<BookingData>(() => {
    // If we have initial data from Build Your Party, use it
    if (initialData) {
      // Convert selected add-on IDs to AddOns object
      const addOns: AddOns = { ...initialAddOns };
      if (initialData.buildMode === "custom" && initialData.selectedAddOns.length > 0) {
        initialData.selectedAddOns.forEach((addOnId) => {
          if (addOnId === "discoBall") addOns.discoBall = true;
          if (addOnId === "redRopesCarpet") addOns.redRopesCarpet = true;
          if (addOnId === "curatedPlaylist") addOns.curatedPlaylist = true;
          if (addOnId === "wirelessMicrophone") addOns.wirelessMicrophone = true;
          if (addOnId === "glowBags") addOns.glowBags = true;
          if (addOnId === "extraHour") addOns.extraHour = true;
          if (addOnId === "overnightPackage") addOns.overnightPackage = true;
        });
      }

      // Calculate pricing
      let subtotal = initialData.totalPrice;

      return {
        ...initialBookingData,
        currentStep: 3, // Skip to date selection since venue + experience is pre-selected
        product: initialData.product,
        package: initialData.buildMode === "package" ? initialData.package : "Party Starter",
        addOns,
        pricing: {
          ...initialPricing,
          subtotal,
          total: subtotal,
        },
      };
    }
    return initialBookingData;
  });

  // Load from localStorage on mount (only if no initial data provided)
  useEffect(() => {
    if (initialData) return; // Skip localStorage if we have initial data

    const savedData = localStorage.getItem("partylab_booking");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Merge with initial state to ensure all fields exist (handles schema updates)
        setBookingData({
          ...initialBookingData,
          ...parsed,
          addOns: {
            ...initialAddOns,
            ...(parsed.addOns || {}),
          },
          pricing: {
            ...initialPricing,
            ...(parsed.pricing || {}),
          },
        });
      } catch (error) {
        console.error("Failed to parse saved booking data:", error);
        // Clear corrupted data
        localStorage.removeItem("partylab_booking");
      }
    }
  }, [initialData]);

  // Save to localStorage whenever bookingData changes
  useEffect(() => {
    if (bookingData.currentStep > 1 || bookingData.product) {
      localStorage.setItem("partylab_booking", JSON.stringify(bookingData));
    }
  }, [bookingData]);

  const updateProduct = (product: BookingData["product"]) => {
    setBookingData((prev) => ({ ...prev, product }));
  };

  const updateDateTime = (date: string, timeBlock: BookingData["timeBlock"], extraHours: number = 0) => {
    setBookingData((prev) => {
      // Tiered pricing: $50 for first extra hour, $75 for each additional hour
      let extraHoursCost = 0;
      if (extraHours === 1) {
        extraHoursCost = 50;
      } else if (extraHours > 1) {
        extraHoursCost = 50 + (75 * (extraHours - 1));
      }

      const currentAddOnsCost =
        (prev.addOns.discoBall ? 30 : 0) +
        (prev.addOns.redRopesCarpet ? 75 : 0) +
        (prev.addOns.curatedPlaylist ? 50 : 0) +
        (prev.addOns.wirelessMicrophone ? 50 : 0) +
        (prev.addOns.glowBags ? 50 : 0) +
        (prev.addOns.extraHour ? 50 : 0) +
        (prev.addOns.overnightPackage ? 150 : 0);

      const basePackagePrice = prev.pricing.subtotal - currentAddOnsCost - prev.pricing.extraHoursCost;
      const newSubtotal = basePackagePrice + currentAddOnsCost + extraHoursCost;

      return {
        ...prev,
        date,
        timeBlock,
        pricing: {
          ...prev.pricing,
          extraHours,
          extraHoursCost,
          subtotal: newSubtotal,
          total: newSubtotal,
        },
      };
    });
  };

  const updatePackage = (pkg: BookingData["package"], price: number) => {
    setBookingData((prev) => {
      const newSubtotal = price;
      return {
        ...prev,
        package: pkg,
        pricing: {
          ...prev.pricing,
          subtotal: newSubtotal,
          total: newSubtotal, // Package price already includes booking fee
        },
      };
    });
  };

  const updateAddOns = (addOns: AddOns) => {
    setBookingData((prev) => {
      // Calculate add-on prices
      let addOnTotal = 0;
      if (addOns.discoBall) addOnTotal += 30;
      if (addOns.redRopesCarpet) addOnTotal += 75;
      if (addOns.curatedPlaylist) addOnTotal += 50;
      if (addOns.wirelessMicrophone) addOnTotal += 50;
      if (addOns.glowBags) addOnTotal += 50;
      if (addOns.extraHour) addOnTotal += 50;
      if (addOns.overnightPackage) addOnTotal += 150;

      // Get base package price from current subtotal (excluding previous add-ons and extra hours)
      const previousAddOnsCost =
        (prev.addOns.discoBall ? 30 : 0) +
        (prev.addOns.redRopesCarpet ? 75 : 0) +
        (prev.addOns.curatedPlaylist ? 50 : 0) +
        (prev.addOns.wirelessMicrophone ? 50 : 0) +
        (prev.addOns.glowBags ? 50 : 0) +
        (prev.addOns.extraHour ? 50 : 0) +
        (prev.addOns.overnightPackage ? 150 : 0);

      const basePackagePrice = prev.pricing.subtotal - previousAddOnsCost - prev.pricing.extraHoursCost;

      const newSubtotal = basePackagePrice + addOnTotal + prev.pricing.extraHoursCost;

      return {
        ...prev,
        addOns,
        pricing: {
          ...prev.pricing,
          subtotal: newSubtotal,
          total: newSubtotal, // Package price already includes booking fee
        },
      };
    });
  };

  const updateCustomer = (customer: CustomerInfo) => {
    setBookingData((prev) => ({ ...prev, customer }));
  };

  const updateTripCharge = (tripCharge: number) => {
    setBookingData((prev) => {
      const newTotal = prev.pricing.subtotal + tripCharge;
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          tripCharge,
          total: newTotal,
        },
      };
    });
  };

  const updateBookingId = (bookingId: string, paymentIntentId: string, clientSecret?: string) => {
    setBookingData((prev) => ({
      ...prev,
      bookingId,
      paymentIntentId,
      ...(clientSecret && { clientSecret })
    }));
  };

  const nextStep = () => {
    setBookingData((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  };

  const prevStep = () => {
    setBookingData((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const goToStep = (step: number) => {
    setBookingData((prev) => ({ ...prev, currentStep: step }));
  };

  const resetBooking = () => {
    setBookingData(initialBookingData);
    localStorage.removeItem("partylab_booking");
  };

  // New 6-step flow: 1-Venue, 2-Experience, 3-Date, 4-Info, 5-Payment, 6-Done
  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1: // Venue
        return bookingData.product !== null;
      case 2: // Experience (package/add-ons)
        return bookingData.package !== null;
      case 3: // Date & Time
        return bookingData.date !== null && bookingData.timeBlock !== null;
      case 4: // Customer Info
        return bookingData.customer !== null;
      case 5: // Payment
        return bookingData.bookingId !== null;
      case 6: // Confirmation
        return bookingData.bookingId !== null;
      default:
        return false;
    }
  };

  const arePreviousStepsCompleted = (step: number): boolean => {
    // Check if all steps before the given step are completed
    for (let i = 1; i < step; i++) {
      if (!isStepCompleted(i)) {
        return false;
      }
    }
    return true;
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateProduct,
        updateDateTime,
        updatePackage,
        updateAddOns,
        updateCustomer,
        updateTripCharge,
        updateBookingId,
        nextStep,
        prevStep,
        goToStep,
        resetBooking,
        isStepCompleted,
        arePreviousStepsCompleted,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
