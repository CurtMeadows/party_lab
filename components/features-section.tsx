import { Lightbulb, Music, Users } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Immersive Lighting",
    description: "LED lights and projected dance videos create an electric atmosphere.",
  },
  {
    icon: Music,
    title: "Bluetooth Sound",
    description: "Plug in your own playlist. No DJ needed."
  },
  {
    icon: Users,
    title: "All Ages Welcome",
    description: "Kids dance parties to teen nightclub experiences.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 bg-background border-b border-border/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-6 text-glow-purple">
          Why Choose The Partylab?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-card/30 border border-border/50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
