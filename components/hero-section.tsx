"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, Instagram, MessageCircle, DollarSign } from "lucide-react";
import Image from "next/image";
import { TalkToUsModal } from "@/components/talk-to-us-modal";

interface HeroSectionProps {
  onBookNowClick?: () => void;
}

export function HeroSection({ onBookNowClick }: HeroSectionProps = {}) {
  const [isTalkToUsOpen, setIsTalkToUsOpen] = useState(false);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Image
          src="/logo-small.png"
          alt="The Partylab"
          width={96}
          height={96}
          className="w-14 h-14 sm:w-20 sm:h-20"
          priority
        />
      </div>

      {/* Social Links - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex gap-2">
        <a
          href="https://instagram.com/partylabaz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          style={{ background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)" }}
          aria-label="Follow us on Instagram"
        >
          <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </a>
        <a
          href="https://www.facebook.com/people/Partylabaz/61579352249971"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] flex items-center justify-center transition-all hover:scale-110 shadow-lg hover:bg-[#0d6edb]"
          aria-label="Follow us on Facebook"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/hero.JPG')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center pt-16 pb-8 sm:py-12 px-4">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-primary/50 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-white/90">From Backyard Parties to Community Events — Arizona&apos;s Premier Inflatable Nightclub Experience</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight text-white drop-shadow-2xl">
            Bring the{" "}
            <span className="text-glow-purple bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Nightclub
            </span>
            <br />
            to Your Backyard
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4">
            Turn any space into a nightclub! Inflatable nightclubs with LED lighting and curated playlists—made for birthdays, teen parties, and unforgettable celebrations.
          </p>

          {/* CTA Buttons — 3 tabs in a row */}
          <div className="flex flex-row gap-2 justify-center items-stretch w-full max-w-lg mx-auto">
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-4 sm:py-5 rounded-2xl border-2 border-primary/60 bg-primary/20 backdrop-blur-sm text-white hover:bg-primary/30 hover:border-primary hover:scale-105 active:scale-95 transition-all text-center shadow-lg"
              onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}
            >
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-xs sm:text-sm font-bold leading-tight">View Pricing</span>
            </button>
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-4 sm:py-5 rounded-2xl border-2 border-pink-400/60 bg-pink-500/20 backdrop-blur-sm text-white hover:bg-pink-500/30 hover:border-pink-400 hover:scale-105 active:scale-95 transition-all text-center shadow-lg"
              onClick={() => setIsTalkToUsOpen(true)}
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
              <span className="text-xs sm:text-sm font-bold leading-tight">Talk to Us First</span>
            </button>
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-4 sm:py-5 rounded-2xl border-2 border-primary gradient-purple-pink glow-pink text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all text-center shadow-xl"
              onClick={onBookNowClick}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-bold leading-tight">Book Now</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-5 flex flex-col items-center gap-3 mb-4">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl px-8 py-4 text-center">
              <p className="text-3xl sm:text-4xl font-bold text-accent">AZ</p>
              <p className="text-sm sm:text-base text-white/90">Statewide Service</p>
            </div>
            <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white">
              <span className="text-2xl">✅</span>
              <span>Fully Insured</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Talk to Us Modal */}
      <TalkToUsModal
        isOpen={isTalkToUsOpen}
        onClose={() => setIsTalkToUsOpen(false)}
      />
    </section>
  );
}
