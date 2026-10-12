"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "@/app/actions/submit-form";
import { EVENT_TYPES } from "@/lib/constants";

interface TalkToUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TalkToUsModal({ isOpen, onClose }: TalkToUsModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const result = await submitContactForm(formData);

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message: "Thanks! We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", phone: "", eventType: "", message: "" });
      setTimeout(() => {
        onClose();
        setSubmitStatus({ type: null, message: "" });
      }, 2000);
    } else {
      setSubmitStatus({
        type: "error",
        message: result.error || "Something went wrong. Please try again.",
      });
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card border-2 border-primary rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto glow-purple animate-slide-up pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-glow-purple">
              👋 We're Here to Help!
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground text-center mb-6">
              Send us a message and we'll get back to you soon!
            </p>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(602) 555-1234"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) => handleChange("eventType", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select event type...</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message / Questions</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us about your event or ask any questions..."
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>

                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === "success"
                          ? "bg-green-500/10 border border-green-500 text-green-500"
                          : "bg-red-500/10 border border-red-500 text-red-500"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-purple-pink glow-purple text-white font-semibold"
                size="lg"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>

            {/* Alternative Contact Methods */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Or reach out directly with questions:
              </p>

              <div className="flex flex-col gap-3">

                {/* Email */}
                <a
                  href="mailto:partylabaz@gmail.com"
                  className="flex items-center justify-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-all group"
                >
                  <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm">Email Us</span>
                    <span className="text-xs text-muted-foreground">partylabaz@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
