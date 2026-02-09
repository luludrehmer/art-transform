import { Loader2 } from "lucide-react";

/**
 * Full-screen overlay shown immediately when user clicks "Order" on art-transform,
 * before the redirect to Photos-to-Paintings checkout. Stays visible until
 * window.location.href is set or an error toast is shown.
 */
export function CheckoutRedirectOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
      role="alert"
      aria-live="polite"
      aria-label="Preparing checkout"
    >
      <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Preparing checkout</h2>
          <p className="text-sm text-muted-foreground">
            Redirecting to our secure checkout. Do not close this window.
          </p>
        </div>
      </div>
    </div>
  );
}
