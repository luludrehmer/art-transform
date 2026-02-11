import { Truck } from "lucide-react";

interface FreeShippingBadgeProps {
  /** e.g. "5-7 days" for prints, "2-4 weeks" for handmade */
  deliveryTime?: string;
}

export function FreeShippingBadge({ deliveryTime = "2-4 weeks" }: FreeShippingBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
      <Truck className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">
          Free Shipping <span className="font-normal text-muted-foreground">($20 value)</span>
        </p>
        <p className="text-xs text-muted-foreground">Delivery: {deliveryTime}</p>
      </div>
    </div>
  );
}
