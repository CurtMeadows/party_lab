"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does setup and takedown take?",
    answer: "Setup takes approximately 30 minutes, and takedown is just as quick. We handle everything from start to finish so you can focus on enjoying your event!"
  },
  {
    question: "What areas do you serve in Arizona?",
    answer: "We're based in the East Valley and proudly serve Tempe, Mesa, Chandler, Gilbert, and Queen Creek within 15 miles at no extra charge — and we accept bookings statewide across Arizona. A travel surcharge applies beyond 15 miles: $40 for 15-20 miles, $50 for 21-30 miles, $75 for 31-40 miles. For locations over 40 miles, please contact us."
  },
  {
    question: "What's included in the rental packages?",
    answer: "All packages include the inflatable nightclub, LED lighting, sound system, and professional setup/teardown. Higher-tier packages add red carpet, glow kits, and curated playlists."
  },
  {
    question: "How many guests can the inflatable nightclub accommodate?",
    answer: "Our Dance Dome comfortably fits 10–15 guests, while our larger setups — the Light Haus and Club Noir — can accommodate 15–30 guests for the ultimate party experience!"
  },
  {
    question: "Do I need to provide power?",
    answer: "Yes, we need access to standard electrical outlets (110V) for the blower, lights, and sound system. We bring all necessary extension cords and equipment. You can also rent our generator for an extra $75."
  },
  {
    question: "What if it rains or weather is bad?",
    answer: "Our inflatables work great indoors or outdoors! For outdoor events, we monitor weather and can reschedule if needed. Indoor setup requires adequate ceiling height and space."
  },
  {
    question: "Can I extend my rental time?",
    answer: "Absolutely! The first extra hour is $50, and each additional hour after that is $75."
  },
  {
    question: "What music themes are available?",
    answer: "We offer Disney, Glow Dance Party, Pop Star, '90s, EDM, Kpop, and Kids themes. Each includes a curated 1.5-hour playlist with warm-up, high energy, dance games, and finale. Custom playlists are also available!"
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-glow-purple">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Got questions? We've got answers!
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-base sm:text-lg text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-base text-muted-foreground animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
