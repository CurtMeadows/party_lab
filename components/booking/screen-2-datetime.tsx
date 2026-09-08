"use client";

import { useState, useEffect } from "react";
import { useBooking } from "./booking-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, addHours, isAfter } from "date-fns";
import { TIME_BLOCKS, MIN_HOURS_ADVANCE } from "@/lib/constants";
import { checkAvailability } from "@/app/actions/check-availability";
import type { TimeBlock } from "@/types/booking";
import "react-day-picker/dist/style.css";

export function Screen2DateTime() {
  const { bookingData, updateDateTime, nextStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.date ? new Date(bookingData.date) : undefined
  );
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock | null>(
    bookingData.timeBlock
  );
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");

  // 12-hour format state
  const [startHour, setStartHour] = useState("5");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("PM");
  const [endHour, setEndHour] = useState("8");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("PM");

  // Calculate minimum date (48 hours from now)
  const minDate = addHours(new Date(), MIN_HOURS_ADVANCE);

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, period: string): string => {
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };

  // Calculate duration in hours
  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const durationMs = end.getTime() - start.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
  };

  // Update customStartTime when 12-hour inputs change
  useEffect(() => {
    if (startHour && startMinute && startPeriod) {
      const time24 = convertTo24Hour(startHour, startMinute, startPeriod);
      setCustomStartTime(time24);
    }
  }, [startHour, startMinute, startPeriod]);

  // Update customEndTime when 12-hour inputs change
  useEffect(() => {
    if (endHour && endMinute && endPeriod) {
      const time24 = convertTo24Hour(endHour, endMinute, endPeriod);
      setCustomEndTime(time24);
    }
  }, [endHour, endMinute, endPeriod]);

  // Initialize custom time fields from saved booking data
  useEffect(() => {
    if (bookingData.timeBlock) {
      const isPredefinedBlock = TIME_BLOCKS.some(block => block.value === bookingData.timeBlock);

      if (!isPredefinedBlock) {
        const [start, end] = bookingData.timeBlock.split("-");
        setIsCustomTime(true);
        setCustomStartTime(start);
        setCustomEndTime(end);
        setSelectedTimeBlock(null);
      }
    }
  }, []);

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate && bookingData.product) {
      checkAvailabilityForDate(selectedDate);
    }
  }, [selectedDate, bookingData.product]);

  const checkAvailabilityForDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const product = bookingData.product;

      if (!product) {
        setAvailableBlocks([]);
        setIsDateBlocked(false);
        setBlockedReason(null);
        return;
      }

      const result = await checkAvailability(formattedDate, product);

      if (result.success) {
        setAvailableBlocks(result.availableBlocks);
        setIsDateBlocked(result.isBlocked || false);
        setBlockedReason(result.reason || null);
      } else {
        setAvailableBlocks([]);
        setIsDateBlocked(false);
        setBlockedReason(null);
      }
    } catch (error) {
      console.error("Failed to check availability:", error);
      setAvailableBlocks([]);
      setIsDateBlocked(false);
      setBlockedReason(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeBlock(null);
    // Automatically open custom time picker when date is selected
    setIsCustomTime(true);
    // Reset to default times
    setStartHour("5");
    setStartMinute("00");
    setStartPeriod("PM");
    setEndHour("8");
    setEndMinute("00");
    setEndPeriod("PM");
  };

  const handleTimeBlockSelect = (block: TimeBlock) => {
    setSelectedTimeBlock(block);
    setIsCustomTime(false);
  };

  const handleCustomTimeSelect = () => {
    setIsCustomTime(true);
    setSelectedTimeBlock(null);
  };

  const handleContinue = () => {
    if (selectedDate && customStartTime && customEndTime && customStartTime < customEndTime) {
      // Just save the time selection, don't charge yet (charge based on package later)
      const timeBlock: TimeBlock = `${customStartTime}-${customEndTime}`;
      updateDateTime(format(selectedDate, "yyyy-MM-dd"), timeBlock, 0);
      nextStep();
    }
  };

  // Filter time blocks based on day of week
  const getAvailableTimeBlocks = () => {
    if (!selectedDate) return TIME_BLOCKS;

    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return TIME_BLOCKS;
    } else {
      return TIME_BLOCKS.filter(block => block.value === "17:00-20:00");
    }
  };

  const isCustomTimeValid = customStartTime && customEndTime && customStartTime < customEndTime;

  // Check if selected time is during daylight hours (before 5 PM)
  const isDaylightBooking = () => {
    if (selectedTimeBlock) {
      const startTime = selectedTimeBlock.split("-")[0];
      const hour = parseInt(startTime.split(":")[0]);
      return hour < 17;
    }
    if (isCustomTime && customStartTime) {
      const hour = parseInt(customStartTime.split(":")[0]);
      return hour < 17;
    }
    return false;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4 text-glow-purple">
          Pick Your Date & Time
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select a date at least 48 hours in advance
        </p>

        {/* Compact 48-hour contact notice */}
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-lg">
          <span className="text-muted-foreground">Need to book sooner?</span>
          <div className="flex gap-2">
            <a
              href="tel:6027995856"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              <Phone className="w-4 h-4" />
              Call/Text
            </a>
            <span className="text-muted-foreground">or</span>
            <a
              href="mailto:partylabaz@gmail.com"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </div>

        {/* Selection Summary */}
        {bookingData.product && (
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
            <span className="text-sm text-muted-foreground">Your selection:</span>
            <span className="text-sm font-semibold text-primary">{bookingData.product}</span>
            {bookingData.package && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm font-semibold text-primary">{bookingData.package}</span>
              </>
            )}
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-bold text-green-500">${bookingData.pricing.subtotal}</span>
          </div>
        )}
      </div>

      {/* Daylight projector warning */}
      {isDaylightBooking() && (
        <div className="max-w-3xl mx-auto px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
            ☀️ Note: LED lights and projector visibility may be limited with daylight bookings. We recommend evening events for best visual effects.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Calendar */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Select Date
          </h3>
          <div className="mb-3 px-3 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-500 text-center">
            <p>🎉 Bookings are open for October 17th and beyond!</p>
          </div>
          <div className="flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={[
                { before: minDate },
                { after: new Date("2026-05-01T00:00:00-07:00"), before: new Date("2026-10-17T00:00:00-07:00") },
              ]}
              className="border rounded-lg p-4"
              styles={{
                day_selected: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                },
                day_today: {
                  fontWeight: "bold",
                },
              }}
            />
          </div>
        </Card>

        {/* Time Blocks */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Select Time Block</h3>
          {!selectedDate ? (
            <p className="text-muted-foreground text-center py-8">
              Please select a date first
            </p>
          ) : isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Checking availability...
            </p>
          ) : isDateBlocked ? (
            <div className="py-8 space-y-4">
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Calendar className="w-6 h-6" />
                <p className="font-semibold text-lg">Date Already Booked</p>
              </div>
              <p className="text-center text-muted-foreground">
                {blockedReason || `${bookingData.product} is already booked for ${selectedDate ? format(selectedDate, "MMMM d, yyyy") : "this date"}`}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Please select a different date from the calendar
              </p>
              <div className="flex flex-col gap-2 items-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Need help finding an available date?</p>
                <div className="flex gap-2">
                  <a
                    href="tel:6027995856"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call/Text Us
                  </a>
                  <span className="text-muted-foreground">or</span>
                  <a
                    href="mailto:partylabaz@gmail.com"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Custom Time Option - Always visible when date is selected */}
              <button
                onClick={handleCustomTimeSelect}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isCustomTime
                    ? "border-primary bg-primary/10 glow-purple"
                    : "border-border hover:border-primary hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Choose Your Time Block
                  </span>
                  <span className="text-sm text-muted-foreground">Select start and end time</span>
                </div>
              </button>

              {/* Custom Time Inputs - 12 Hour Format */}
              {isCustomTime && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="space-y-4">
                    {/* Start Time */}
                    <div>
                      <Label className="text-sm font-medium">Start Time</Label>
                      <div className="flex gap-2 mt-1">
                        <select
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <select
                          value={startMinute}
                          onChange={(e) => setStartMinute(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                        <select
                          value={startPeriod}
                          onChange={(e) => setStartPeriod(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    {/* End Time */}
                    <div>
                      <Label className="text-sm font-medium">End Time</Label>
                      <div className="flex gap-2 mt-1">
                        <select
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <select
                          value={endMinute}
                          onChange={(e) => setEndMinute(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                        <select
                          value={endPeriod}
                          onChange={(e) => setEndPeriod(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    {customStartTime && customEndTime && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {customStartTime < customEndTime ? (
                            <span className="text-green-500">
                              ✓ Duration: {Math.round((new Date(`1970-01-01T${customEndTime}`).getTime() - new Date(`1970-01-01T${customStartTime}`).getTime()) / (1000 * 60 * 60) * 10) / 10} hours
                            </span>
                          ) : (
                            <span className="text-red-500">End time must be after start time</span>
                          )}
                        </p>
                        {(() => {
                          const duration = calculateDuration(customStartTime, customEndTime);
                          if (duration > 3) {
                            const extraHours = Math.ceil(duration - 3);
                            const extraHoursCost = extraHours === 1 ? 50 : 50 + 75 * (extraHours - 1);
                            return (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 flex gap-2">
                                <span className="text-blue-500 text-lg">⏰</span>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  <strong>Extended hours selected ({extraHours} {extraHours === 1 ? 'hour' : 'hours'} beyond 3):</strong><br />
                                  • <strong>All-Star VIP</strong> includes extended hours at no extra charge<br />
                                  • <strong>Party Starter</strong> or <strong>Glow Getter</strong>: Add ${extraHoursCost} (${extraHours === 1 ? '$50 for 1 hour' : `$50 first hour + $75 × ${extraHours - 1} hours`})
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              )}

            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={handleContinue}
          disabled={!selectedDate || !isCustomTimeValid}
          size="lg"
          className="gradient-purple-pink glow-purple text-white font-semibold px-12"
        >
          Continue to Info →
        </Button>
      </div>

    </div>
  );
}
