import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps artwork with screenshot mitigation (best-effort only).
 * - Blocks PrintScreen key
 * - Auto-blur when mouse leaves the container (reduces casual screenshots)
 * Note: Determined users can still capture via OS tools or DevTools.
 */
export function ArtworkProtection({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
        e.preventDefault();
      }
    };

    const handleMouseEnter = () => setIsBlurred(false);
    const handleMouseLeave = () => setIsBlurred(true);

    document.addEventListener("keydown", handleKeyDown);
    const el = containerRef.current;
    el?.addEventListener("mouseenter", handleMouseEnter);
    el?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      el?.removeEventListener("mouseenter", handleMouseEnter);
      el?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        "relative transition-all duration-300",
        isBlurred && "select-none",
        className
      )}
      style={{
        filter: isBlurred ? "blur(12px)" : "none",
        userSelect: isBlurred ? "none" : undefined,
      }}
    >
      {children}
    </div>
  );
}
