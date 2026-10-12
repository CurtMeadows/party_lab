"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Mail, AlertTriangle } from "lucide-react";

interface OutOfServiceModalProps {
  isOpen: boolean;
  distance: number;
  customerAddress: string;
  onClose: () => void;
}

export function OutOfServiceModal({
  isOpen,
  distance,
  customerAddress,
  onClose,
}: OutOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 sm:p-8 bg-card border-2 border-amber-500 animate-fade-in">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold">
              Contact Us for This Location
            </h3>
            <p className="text-muted-foreground">
              Your event is over 40 miles away — please contact us to discuss options
            </p>
          </div>

          {/* Distance Info */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Event Location:</p>
                <p className="text-xs text-muted-foreground">{customerAddress}</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distance from base:</span>
              <span className="font-semibold text-amber-500">{distance} miles</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Standard service area:</span>
              <span className="font-semibold">Up to 40 miles</span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 flex gap-2 mt-4">
              <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">
                For locations over 40 miles from our base in Tempe, please contact us directly to discuss availability and pricing.
              </p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            <p className="text-center text-sm font-semibold">
              Special Request? Let's Talk!
            </p>
            <p className="text-center text-xs text-muted-foreground">
              We may be able to make special arrangements for your event. Contact us to discuss options:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="mailto:partylabaz@gmail.com"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="w-full mt-2"
            >
              Go Back & Change Address
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
