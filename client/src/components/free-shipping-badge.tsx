import { Truck } from "lucide-react";

export function FreeShippingBadge() {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
      <Truck className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">
          Free Shipping <span className="font-normal text-muted-foreground">($20 value)</span>
        </p>
        <p className="text-xs text-muted-foreground">Delivery: 2-4 weeks</p>
      </div>
    </div>
  );
}
