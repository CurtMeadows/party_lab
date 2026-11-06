"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { addDays, format } from "date-fns";
import { X, Check, ChevronLeft, Sparkles, Loader2, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRODUCTS,
  EVENT_TYPES,
  MIN_HOURS_ADVANCE,
  REQUEST_ADD_ONS,
  REQUEST_DURATIONS,
  getBasePrice,
} from "@/lib/constants";
import { formatTime12Hour } from "@/lib/format-time";
import { sendBookingRequest, type BookingRequest } from "@/app/actions/send-booking-request";
import type { InitialBookingData } from "@/types/booking";

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InitialBookingData;
}

const START_TIMES = Array.from({ length: 23 }, (_, i) => {
  const minutes = 9 * 60 + i * 30; // 9:00 AM to 8:00 PM
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

const SURFACES = ["Grass", "Turf", "Driveway / concrete", "Rocks (need a tarp)", "Indoors", "Not sure"];
const HEAR_ABOUT = ["Facebook", "Instagram", "Google", "Referral", "Other"];

const emptyRequest: BookingRequest = {
  product: "Not sure",
  addOns: [],
  date: "",
  backupDate: "",
  startTime: "",
  duration: "3",
  eventType: "",
  guestCount: "",
  location: "",
  setupSurface: "",
  name: "",
  email: "",
  phone: "",
  hearAboutUs: "",
  notes: "",
  website: "",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BookingRequestModal({ isOpen, onClose, initialData }: BookingRequestModalProps) {
  const [step, setStep] = useState(1);
  const [request, setRequest] = useState<BookingRequest>(emptyRequest);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show each step from the top (matters on phones, where the form scrolls)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step, sent]);

  // Start fresh each time the modal opens, carrying over anything picked in Build Your Party
  useEffect(() => {
    if (!isOpen) return;
    const picked = initialData?.selectedAddOns ?? [];
    setRequest({
      ...emptyRequest,
      product: initialData?.product ?? "Not sure",
      addOns: picked.filter((id) => REQUEST_ADD_ONS.some((a) => a.id === id)),
      duration: picked.includes("overnightPackage") ? "overnight" : picked.includes("extraHour") ? "4" : "3",
    });
    setStep(1);
    setErrors({});
    setSendError("");
    setSent(false);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const minDate = format(addDays(new Date(), Math.ceil(MIN_HOURS_ADVANCE / 24)), "yyyy-MM-dd");
  const duration = REQUEST_DURATIONS.find((d) => d.value === request.duration) ?? REQUEST_DURATIONS[0];
  const estimate =
    request.product === "Not sure"
      ? null
      : getBasePrice(request.product) +
        REQUEST_ADD_ONS.filter((a) => request.addOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0) +
        duration.price;

  const set = (field: keyof BookingRequest, value: string) => {
    setRequest((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleAddOn = (id: string) =>
    setRequest((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(id) ? prev.addOns.filter((a) => a !== id) : [...prev.addOns, id],
    }));

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!request.date) next.date = "Please choose a date";
    else if (request.date < minDate) next.date = `Please choose a date at least ${MIN_HOURS_ADVANCE} hours away`;
    if (!request.startTime) next.startTime = "Please choose a start time";
    if (!request.location.trim()) next.location = "Please tell us the city or address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = () => {
    const next: Record<string, string> = {};
    if (!request.name.trim()) next.name = "Name is required";
    if (!request.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())) next.email = "Please enter a valid email";
    if (!request.phone.trim()) next.phone = "Phone is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setIsSending(true);
    setSendError("");
    const result = await sendBookingRequest(request);
    setIsSending(false);
    if (result.success) setSent(true);
    else setSendError(result.error || "Something went wrong. Please email us at partylabaz@gmail.com.");
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-sm text-destructive mt-1">{errors[field]}</p> : null;

  const summary = (
    <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm space-y-1">
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Venue</span>
        <span className="font-semibold text-right">{request.product === "Not sure" ? "Help me choose" : request.product}</span>
      </div>
      {request.addOns.length > 0 && (
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Add-ons</span>
          <span className="font-semibold text-right">
            {REQUEST_ADD_ONS.filter((a) => request.addOns.includes(a.id)).map((a) => a.name).join(", ")}
          </span>
        </div>
      )}
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Length</span>
        <span className="font-semibold text-right">{duration.label}</span>
      </div>
      {request.date && (
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Date</span>
          <span className="font-semibold text-right">
            {format(new Date(`${request.date}T12:00:00`), "EEE, MMM d, yyyy")}
            {request.startTime && ` at ${formatTime12Hour(request.startTime)}`}
          </span>
        </div>
      )}
      {estimate !== null && (
        <div className="flex justify-between gap-3 pt-2 mt-1 border-t border-border">
          <span className="text-muted-foreground">Estimated total</span>
          <span className="font-bold text-primary">${estimate}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={scrollRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-request-title"
          className="bg-card border-2 border-primary rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto glow-purple animate-slide-up pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="booking-request-title" className="text-xl sm:text-2xl font-bold text-glow-pink">
                {sent ? "Request Sent!" : "Request to Book"}
              </h2>
              {!sent && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Step {step} of 3 · No payment needed to check availability
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full border border-border hover:border-primary flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!sent && (
            <div className="px-5 sm:px-6 pt-4 flex gap-2" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "gradient-purple-pink" : "bg-muted"}`} />
              ))}
            </div>
          )}

          <div className="px-5 sm:px-6 py-5">
            {/* Sent */}
            {sent && (
              <div className="text-center space-y-5 py-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Thanks, {request.name.split(" ")[0]}! We got your request.</p>
                  <p className="text-muted-foreground">
                    We&apos;ll check availability and email you at <span className="text-foreground font-semibold">{request.email}</span>{" "}
                    within 24 hours. Once you&apos;re happy with the details, we&apos;ll send a $100 deposit invoice to lock in your date.
                  </p>
                </div>
                <div className="text-left">{summary}</div>
                <p className="text-sm text-muted-foreground">
                  Questions in the meantime?{" "}
                  <a href="mailto:partylabaz@gmail.com" className="text-primary font-semibold hover:underline">
                    partylabaz@gmail.com
                  </a>
                </p>
                <Button onClick={onClose} className="gradient-purple-pink text-white font-semibold px-8">
                  Done
                </Button>
              </div>
            )}

            {/* Step 1: Party */}
            {!sent && step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-3">Which venue are you interested in?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRODUCTS.map((product) => {
                      const selected = request.product === product.name;
                      return (
                        <button
                          key={product.name}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => set("product", product.name)}
                          className={`rounded-xl border-2 overflow-hidden text-left transition-all ${
                            selected ? "border-primary bg-primary/10 glow-purple" : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <div className="relative h-24 bg-black">
                            <Image src={product.imageUrl} alt="" fill className="object-cover" sizes="200px" />
                            {selected && (
                              <span className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="font-bold">{product.name}</div>
                            <div className="text-sm text-primary font-semibold">Starting at ${getBasePrice(product.name)}</div>
                            <div className="text-xs text-muted-foreground">{product.capacity}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    aria-pressed={request.product === "Not sure"}
                    onClick={() => set("product", "Not sure")}
                    className={`mt-3 w-full rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      request.product === "Not sure" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    Not sure yet — help me choose
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Any add-ons?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {REQUEST_ADD_ONS.map((addOn) => {
                      const selected = request.addOns.includes(addOn.id);
                      return (
                        <button
                          key={addOn.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleAddOn(addOn.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selected ? "border-primary bg-primary/10 glow-purple" : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{addOn.name}</span>
                            {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                          <div className="text-base font-bold text-primary">+${addOn.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">How long?</Label>
                  <select id="duration" value={request.duration} onChange={(e) => set("duration", e.target.value)} className={`${selectClass} mt-1`}>
                    {REQUEST_DURATIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every rental includes LED lighting, Bluetooth speaker, setup &amp; teardown.
                  </p>
                </div>

                {summary}

                <Button type="button" onClick={() => setStep(2)} className="w-full gradient-purple-pink text-white font-semibold py-6 text-base">
                  Next: Date &amp; Location
                </Button>
              </div>
            )}

            {/* Step 2: When & where */}
            {!sent && step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Preferred date *</Label>
                    <Input id="date" type="date" min={minDate} value={request.date} onChange={(e) => set("date", e.target.value)} className="mt-1" />
                    {fieldError("date")}
                  </div>
                  <div>
                    <Label htmlFor="backupDate">Backup date (optional)</Label>
                    <Input id="backupDate" type="date" min={minDate} value={request.backupDate} onChange={(e) => set("backupDate", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Party start time *</Label>
                    <select id="startTime" value={request.startTime} onChange={(e) => set("startTime", e.target.value)} className={`${selectClass} mt-1`}>
                      <option value="">Select a time...</option>
                      {START_TIMES.map((t) => (
                        <option key={t} value={t}>{formatTime12Hour(t)}</option>
                      ))}
                    </select>
                    {fieldError("startTime")}
                  </div>
                  <div>
                    <Label htmlFor="eventType">Type of event</Label>
                    <select id="eventType" value={request.eventType} onChange={(e) => set("eventType", e.target.value)} className={`${selectClass} mt-1`}>
                      <option value="">Select event type...</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="guestCount">About how many guests?</Label>
                    <Input id="guestCount" inputMode="numeric" placeholder="e.g. 20" value={request.guestCount} onChange={(e) => set("guestCount", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="setupSurface">Where will it be set up?</Label>
                    <select id="setupSurface" value={request.setupSurface} onChange={(e) => set("setupSurface", e.target.value)} className={`${selectClass} mt-1`}>
                      <option value="">Select surface...</option>
                      {SURFACES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Party city or address *</Label>
                  <Input id="location" placeholder="e.g. Gilbert, or 123 Main St, Mesa" value={request.location} onChange={(e) => set("location", e.target.value)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">No travel charge within 15 miles of the East Valley. We&apos;ll quote anything farther.</p>
                  {fieldError("location")}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="py-6">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button type="button" onClick={() => validateStep2() && setStep(3)} className="flex-1 gradient-purple-pink text-white font-semibold py-6 text-base">
                    Next: Your Info
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {!sent && step === 3 && (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Your name *</Label>
                    <Input id="name" autoComplete="name" value={request.name} onChange={(e) => set("name", e.target.value)} className="mt-1" />
                    {fieldError("name")}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" autoComplete="email" value={request.email} onChange={(e) => set("email", e.target.value)} className="mt-1" />
                    {fieldError("email")}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" autoComplete="tel" value={request.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" />
                    {fieldError("phone")}
                  </div>
                </div>
                <div>
                  <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
                  <select id="hearAboutUs" value={request.hearAboutUs} onChange={(e) => set("hearAboutUs", e.target.value)} className={`${selectClass} mt-1`}>
                    <option value="">Select...</option>
                    {HEAR_ABOUT.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Anything else we should know?</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={request.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Theme, age of the birthday kid, questions..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                  />
                </div>
                {/* Honeypot for spam bots — hidden from people and screen readers */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" value={request.website} onChange={(e) => set("website", e.target.value)} />
                </div>

                {summary}

                {sendError && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
                    <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                    {sendError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="py-6">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isSending} className="flex-1 gradient-purple-pink text-white font-semibold py-6 text-base">
                    {isSending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {isSending ? "Sending..." : "Send Booking Request"}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  This checks availability only — your date isn&apos;t reserved until we confirm and you pay the $100 deposit.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
