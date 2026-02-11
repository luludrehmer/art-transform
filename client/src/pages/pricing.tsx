import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Frame, Palette } from "lucide-react";
import { FreeShippingBadge } from "@/components/free-shipping-badge";
import { PRINT_SIZES } from "@/lib/print-prices";
import { USE_MEDUSA_PRODUCTS, getProductHandle } from "@/lib/medusa";

export default function Pricing() {
  const [printFromPrice, setPrintFromPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!USE_MEDUSA_PRODUCTS) return;
    const handle = getProductHandle("pets");
    fetch(`/api/art-transform-prices?handle=${encodeURIComponent(handle)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { print?: Record<string, number> }) => {
        const prices = Object.values(data.print ?? {}).filter((p) => p > 0);
        setPrintFromPrice(prices.length > 0 ? Math.min(...prices) : null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-display">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg">
            Create your free preview instantly. Only pay when you're ready to download or print.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Masterpiece</h3>
                <p className="text-sm text-muted-foreground">Digital Download</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">$29</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                High-resolution digital file
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                No watermark
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Instant download
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Print-ready quality
              </li>
            </ul>
            <Button className="w-full" data-testid="button-buy-digital">
              Get Started
            </Button>
          </Card>

          <Card className="p-6 flex flex-col border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Frame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Fine Art Print</h3>
                <p className="text-sm text-muted-foreground">Museum Quality</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">
                {printFromPrice != null ? `From $${printFromPrice.toFixed(2)}` : "—"}
              </span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Everything in Digital
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Premium giclée print
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Archival quality paper
              </li>
            </ul>
            <div className="mb-6">
              <FreeShippingBadge deliveryTime="5-7 days" />
            </div>
            <Button className="w-full" data-testid="button-buy-print">
              Order Print
            </Button>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Oil Painting</h3>
                <p className="text-sm text-muted-foreground">100% Hand-Painted</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">From $299.95</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Painted by master artists
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Oil on Canvas — Hand-Painted
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Museum-grade quality
              </li>
            </ul>
            <div className="mb-6">
              <FreeShippingBadge deliveryTime="2-4 weeks" />
            </div>
            <Button className="w-full" data-testid="button-buy-oil-painting">
              Order Oil Painting
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All purchases include a 30-day satisfaction guarantee. Not happy? We'll make it right.
          </p>
        </div>
      </div>
    </div>
  );
}
