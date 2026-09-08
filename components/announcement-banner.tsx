import { PartyPopper } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <div
      className="w-full px-4 py-3 sm:py-4 text-center"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #ec4899 60%, #f59e0b 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto flex items-start sm:items-center justify-center gap-2">
        <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-white text-xs sm:text-sm leading-snug text-left">
          <span className="font-bold">We&apos;re open again! 🎉</span>
          {" "}Bookings for the new season start{" "}
          <span className="font-semibold underline">October 17th</span>.{" "}
          <a
            href="#request-info"
            className="font-bold underline hover:no-underline transition-all"
          >
            Book your party
          </a>
          {" "}and let&apos;s get the party started!
        </p>
      </div>
    </div>
  );
}
