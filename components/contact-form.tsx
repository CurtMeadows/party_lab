"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { TalkToUsModal } from "@/components/talk-to-us-modal";

export function ContactForm() {
  const [isTalkToUsOpen, setIsTalkToUsOpen] = useState(false);

  return (
    <>
      <section
        id="contact"
        className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-glow-purple">
              Still Have Questions?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Get in touch with us and we'll help you plan the perfect party experience!
            </p>
          </div>

          <div className="bg-card border-2 border-primary rounded-2xl p-8 sm:p-12 glow-purple text-center">
            <Button
              size="lg"
              onClick={() => setIsTalkToUsOpen(true)}
              className="text-xl px-10 py-8 gradient-purple-pink glow-purple text-white font-semibold hover:opacity-90 hover:scale-105 transition-all"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Get in Touch
            </Button>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-base text-muted-foreground mb-6">
                Or reach out directly:
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="mailto:partylabaz@gmail.com"
                  className="inline-flex items-center justify-center gap-3 text-lg font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  partylabaz@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TalkToUsModal
        isOpen={isTalkToUsOpen}
        onClose={() => setIsTalkToUsOpen(false)}
      />
    </>
  );
}
