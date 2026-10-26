const announcementPhrases = ["WEAR YOUR ATTITUDE", "CLOTHING71"] as const;

export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 h-8 w-full overflow-hidden bg-black text-white"
    >
      <p className="sr-only">WEAR YOUR ATTITUDE. CLOTHING71.</p>
      <div aria-hidden="true" className="announcement-marquee-track h-full">
        {[0, 1].map((group) => (
          <div key={group} className="announcement-marquee-group">
            {announcementPhrases.map((phrase) => (
              <span
                key={`${group}-${phrase}`}
                className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.24em]"
              >
                {phrase}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
