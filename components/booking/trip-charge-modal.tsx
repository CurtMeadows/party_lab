"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, AlertCircle, Mail } from "lucide-react";

interface TripChargeModalProps {
  isOpen: boolean;
  distance: number;
  customerAddress: string;
  chargeAmount: number;
  onAccept: () => void;
}

export function TripChargeModal({
  isOpen,
  distance,
  customerAddress,
  chargeAmount,
  onAccept,
}: TripChargeModalProps) {
  if (!isOpen) return null;

  // Determine the distance range text
  const getDistanceRangeText = () => {
    if (distance <= 20) {
      return "15-20 miles";
    } else if (distance <= 30) {
      return "21-30 miles";
    } else {
      return "31-40 miles";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 sm:p-8 bg-card border-2 border-primary glow-purple animate-fade-in">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-glow-purple">
              Travel Surcharge Applies
            </h3>
            <p className="text-muted-foreground">
              Your event location is beyond our free 15-mile service area
            </p>
          </div>

          {/* Distance Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Event Location:</p>
                <p className="text-xs text-muted-foreground">{customerAddress}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance from base:</span>
              <span className="font-semibold">{distance} miles</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Free service area:</span>
              <span className="font-semibold">Up to 15 miles</span>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-semibold">Travel Surcharge ({getDistanceRangeText()}):</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${chargeAmount}
              </span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                A travel surcharge applies for locations beyond 15 miles from our base in Tempe. This helps cover additional travel time and fuel costs.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onAccept}
              size="lg"
              className="w-full gradient-purple-pink glow-purple text-white font-semibold"
            >
              Accept & Continue (Add ${chargeAmount})
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Have questions about the travel surcharge?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="mailto:partylabaz@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
