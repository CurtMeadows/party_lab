"use client";

import { useState } from "react";
import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { EVENT_TYPES } from "@/lib/constants";
import type { CustomerInfo } from "@/types/booking";
import { AlertCircle, Loader2 } from "lucide-react";
import { TripChargeModal } from "./trip-charge-modal";
import { OutOfServiceModal } from "./out-of-service-modal";
import { calculateDistanceFromBase, calculateTripCharge } from "@/lib/distance-calculator";

export function Screen5Customer() {
  const { bookingData, updateCustomer, updateTripCharge, nextStep, arePreviousStepsCompleted } = useBooking();

  const [formData, setFormData] = useState<CustomerInfo>({
    name: bookingData.customer?.name || "",
    email: bookingData.customer?.email || "",
    phone: bookingData.customer?.phone || "",
    address: bookingData.customer?.address || "",
    eventType: bookingData.customer?.eventType || "",
    specialRequests: bookingData.customer?.specialRequests || "",
    playlistRequest: bookingData.customer?.playlistRequest || "",
    hearAboutUs: bookingData.customer?.hearAboutUs || "",
    spaceType: bookingData.customer?.spaceType || "",
    powerSource: bookingData.customer?.powerSource || "",
    wifiMusicAccess: bookingData.customer?.wifiMusicAccess || "",
    surfaceType: bookingData.customer?.surfaceType || "",
    accessPath: bookingData.customer?.accessPath || "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  // Travel surcharge and service area modal state
  const [showTripChargeModal, setShowTripChargeModal] = useState(false);
  const [showOutOfServiceModal, setShowOutOfServiceModal] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedCharge, setCalculatedCharge] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Track if "Other" is selected for surface type
  const [otherSurfaceDescription, setOtherSurfaceDescription] = useState(() => {
    // If saved surfaceType starts with "Other:", extract the description
    if (bookingData.customer?.surfaceType?.startsWith("Other:")) {
      return bookingData.customer.surfaceType.substring(6).trim();
    }
    return "";
  });

  const surfaceTypeOptions = [
    "Grass",
    "Rocks (need a tarp)",
    "Turf",
    "Asphalt",
    "Driveway",
    "Other"
  ];

  // Determine current surface type selection
  const getCurrentSurfaceType = () => {
    if (formData.surfaceType.startsWith("Other:")) {
      return "Other";
    }
    return formData.surfaceType;
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format (use: 123-456-7890)";
    }
    if (!formData.address.trim()) newErrors.address = "Event address is required";
    if (!formData.eventType) newErrors.eventType = "Please select an event type";

    // Pre-Event Readiness Checklist validation
    if (!formData.spaceType?.trim()) newErrors.spaceType = "Space type is required";
    if (!formData.powerSource) newErrors.powerSource = "Power source selection is required";
    if (!formData.wifiMusicAccess) newErrors.wifiMusicAccess = "Wi-Fi/Music access selection is required";
    if (!formData.surfaceType?.trim()) {
      newErrors.surfaceType = "Surface type is required";
    } else if (formData.surfaceType === "Other" || (formData.surfaceType.startsWith("Other:") && formData.surfaceType.trim() === "Other:")) {
      newErrors.surfaceType = "Please describe the surface type";
    }
    if (!formData.accessPath) newErrors.accessPath = "Access path selection is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSurfaceTypeChange = (value: string) => {
    if (value === "Other") {
      // When "Other" is selected, store as "Other:" + description
      setFormData((prev) => ({
        ...prev,
        surfaceType: otherSurfaceDescription ? `Other: ${otherSurfaceDescription}` : "Other"
      }));
    } else {
      // When a predefined option is selected, store it directly
      setFormData((prev) => ({ ...prev, surfaceType: value }));
      setOtherSurfaceDescription(""); // Clear the other description
    }
    // Clear error
    if (errors.surfaceType) {
      setErrors((prev) => ({ ...prev, surfaceType: undefined }));
    }
  };

  const handleOtherSurfaceDescriptionChange = (description: string) => {
    setOtherSurfaceDescription(description);
    setFormData((prev) => ({
      ...prev,
      surfaceType: description ? `Other: ${description}` : "Other"
    }));
    // Clear error
    if (errors.surfaceType) {
      setErrors((prev) => ({ ...prev, surfaceType: undefined }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm() || !agreedToTerms) return;

    // Save customer data
    updateCustomer(formData);

    // Calculate distance and check for service area / trip charge
    setIsCalculatingDistance(true);

    try {
      const distance = await calculateDistanceFromBase(formData.address);

      if (distance === null) {
        // Couldn't calculate distance - proceed without trip charge but warn user
        console.warn("Could not calculate distance for address:", formData.address);
        updateTripCharge(0);
        nextStep();
        return;
      }

      setCalculatedDistance(distance);

      const travelSurcharge = calculateTripCharge(distance);

      if (travelSurcharge === -1) {
        // Over 40 miles: Show contact us modal
        setShowOutOfServiceModal(true);
        setIsCalculatingDistance(false);
        return;
      }

      if (travelSurcharge > 0) {
        // 21-40 miles: Show travel surcharge modal ($40 or $50)
        setCalculatedCharge(travelSurcharge);
        setShowTripChargeModal(true);
      } else {
        // 0-20 miles: No surcharge needed
        updateTripCharge(0);
        nextStep();
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      // Proceed without trip charge on error
      updateTripCharge(0);
      nextStep();
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleAcceptTripCharge = () => {
    updateTripCharge(calculatedCharge);
    setShowTripChargeModal(false);
    nextStep();
  };

  const handleCloseOutOfService = () => {
    setShowOutOfServiceModal(false);
    // User stays on this screen to change their address
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 text-glow-purple">
          Your Information
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us about your event so we can prepare everything perfectly
        </p>
      </div>

      {!arePreviousStepsCompleted(4) && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500">Previous Steps Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please complete the previous steps (Product, Date & Time, and Package) before proceeding to payment. You can click on the step numbers above to navigate back.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card className="max-w-2xl mx-auto p-8">
        <form className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="602-555-1234"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Event Address *</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main St, Phoenix, AZ 85001"
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => handleChange("eventType", e.target.value)}
              className={`flex h-10 w-full rounded-md border ${
                errors.eventType ? "border-destructive" : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <p className="text-sm text-destructive mt-1">{errors.eventType}</p>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              placeholder="Any special requests or requirements for your event..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Playlist Request - only when curated playlist is included */}
          {(bookingData.package === "Glow Getter" || bookingData.package === "All-Star VIP" || bookingData.addOns.curatedPlaylist) && (
            <div>
              <Label htmlFor="playlistRequest">What kind of playlist would you like? (Optional)</Label>
              <textarea
                id="playlistRequest"
                value={formData.playlistRequest}
                onChange={(e) => handleChange("playlistRequest", e.target.value)}
                placeholder="e.g. Pop hits, Disney songs, hip hop clean edits, 2000s throwbacks..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your package includes a curated playlist! Let us know your vibe and we&apos;ll put together the perfect mix.
              </p>
            </div>
          )}

          {/* How did you hear about us? */}
          <div>
            <Label>How did you hear about us?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[
                { value: "Facebook", label: "Facebook" },
                { value: "Instagram", label: "Instagram" },
                { value: "Google", label: "Google" },
                { value: "Referral", label: "Referral" },
                { value: "Other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.hearAboutUs === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="hearAboutUs"
                    value={option.value}
                    checked={formData.hearAboutUs === option.value}
                    onChange={(e) => handleChange("hearAboutUs", e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pre-Event Readiness Checklist */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-xl font-semibold mb-4 text-primary">Pre-Event Readiness Checklist *</h3>
            <div className="space-y-4">
              <div>
                <Label>Is the surface flat and clear of obstacles? *</Label>
                <div className="flex gap-6 mt-2">
                  {["Yes", "No"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="spaceType"
                        value={option}
                        checked={formData.spaceType === option}
                        onChange={(e) => handleChange("spaceType", e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.spaceType && (
                  <p className="text-sm text-destructive mt-1">{errors.spaceType}</p>
                )}
              </div>

              <div>
                <Label htmlFor="surfaceType">Surface Type *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  This helps us know whether to bring stakes or sandbags for setup.
                </p>
                <select
                  id="surfaceType"
                  value={getCurrentSurfaceType()}
                  onChange={(e) => handleSurfaceTypeChange(e.target.value)}
                  className={`flex h-10 w-full rounded-md border ${
                    errors.surfaceType ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  <option value="">Select surface type...</option>
                  {surfaceTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {getCurrentSurfaceType() === "Other" && (
                  <div className="mt-3">
                    <Input
                      id="otherSurfaceDescription"
                      type="text"
                      value={otherSurfaceDescription}
                      onChange={(e) => handleOtherSurfaceDescriptionChange(e.target.value)}
                      placeholder="Please describe the surface type..."
                      className={errors.surfaceType ? "border-destructive" : ""}
                    />
                  </div>
                )}
                {errors.surfaceType && (
                  <p className="text-sm text-destructive mt-1">{errors.surfaceType}</p>
                )}
              </div>

              <div>
                <Label>Power Source *</Label>
                <p className="text-sm text-muted-foreground mb-2">Is a grounded electrical outlet available near the setup area?</p>
                <div className="flex gap-6">
                  {["Yes", "No", "N/A"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="powerSource"
                        value={option}
                        checked={formData.powerSource === option}
                        onChange={(e) => handleChange("powerSource", e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.powerSource && (
                  <p className="text-sm text-destructive mt-1">{errors.powerSource}</p>
                )}
              </div>

              <div>
                <Label>Wi-Fi / Music Access *</Label>
                <p className="text-sm text-muted-foreground mb-2">Does the setup location support Wi-Fi or a music device connection if needed?</p>
                <div className="flex gap-6">
                  {["Yes", "No", "N/A"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="wifiMusicAccess"
                        value={option}
                        checked={formData.wifiMusicAccess === option}
                        onChange={(e) => handleChange("wifiMusicAccess", e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.wifiMusicAccess && (
                  <p className="text-sm text-destructive mt-1">{errors.wifiMusicAccess}</p>
                )}
              </div>

              <div>
                <Label>Access Path *</Label>
                <p className="text-sm text-muted-foreground mb-2">Is there a clear path (about 3–4 feet wide) from delivery point to setup area?</p>
                <div className="flex gap-6">
                  {["Yes", "No", "N/A"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accessPath"
                        value={option}
                        checked={formData.accessPath === option}
                        onChange={(e) => handleChange("accessPath", e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.accessPath && (
                  <p className="text-sm text-destructive mt-1">{errors.accessPath}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
              I understand the $100 deposit is non-refundable and holds my date, time, and product. The remaining balance is due on the event date. *
            </Label>
          </div>
        </form>
      </Card>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleContinue}
          disabled={!agreedToTerms || isCalculatingDistance}
          size="lg"
          className="gradient-purple-pink glow-purple text-white font-semibold px-12"
        >
          {isCalculatingDistance ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking Distance...
            </>
          ) : (
            "Continue to Payment →"
          )}
        </Button>
      </div>

      {/* Travel Surcharge Modal */}
      {calculatedDistance !== null && (
        <TripChargeModal
          isOpen={showTripChargeModal}
          distance={calculatedDistance}
          customerAddress={formData.address}
          chargeAmount={calculatedCharge}
          onAccept={handleAcceptTripCharge}
        />
      )}

      {/* Out of Service Area Modal */}
      {calculatedDistance !== null && (
        <OutOfServiceModal
          isOpen={showOutOfServiceModal}
          distance={calculatedDistance}
          customerAddress={formData.address}
          onClose={handleCloseOutOfService}
        />
      )}
    </div>
  );
}
