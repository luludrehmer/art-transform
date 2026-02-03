import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Truck, Frame } from "lucide-react";

export default function Pricing() {
  return (
    <div className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-serif italic">Simple, Transparent Pricing</h1>
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
              <span className="text-3xl font-bold">$89</span>
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
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Free worldwide shipping
              </li>
            </ul>
            <Button className="w-full" data-testid="button-buy-print">
              Order Print
            </Button>
          </Card>

          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Large Canvas</h3>
                <p className="text-sm text-muted-foreground">Gallery Wrapped</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">$299</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Everything in Print
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                24" x 36" stretched canvas
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Ready to hang
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                White glove delivery
              </li>
            </ul>
            <Button className="w-full" data-testid="button-buy-canvas">
              Order Canvas
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
