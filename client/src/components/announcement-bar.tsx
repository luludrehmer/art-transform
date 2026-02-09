import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="w-full bg-announcement-bar border-b border-announcement-bar-foreground/20 py-1 text-center text-xs tracking-wide font-medium text-announcement-bar-foreground">
      <div className="flex items-center justify-center gap-5">
        <span className="flex items-center gap-1">
          Free Shipping on Prints
          <Truck className="w-3 h-3" />
        </span>
        <span className="hidden sm:inline">Rated 4.8 ★</span>
        <span className="hidden sm:inline">#1 on Reviews.io</span>
        <span className="sm:hidden inline-block min-w-[100px] text-center">#1 on Reviews.io</span>
      </div>
    </div>
  );
}
