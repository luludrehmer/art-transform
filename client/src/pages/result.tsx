import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, RefreshCw, Check, ExternalLink, Share2, Bookmark, Loader2 } from "lucide-react";
import { FreeShippingBadge } from "@/components/free-shipping-badge";
import { CheckoutRedirectOverlay } from "@/components/checkout-redirect-overlay";
import { ProtectedImage } from "@/components/protected-image";
import { USE_MEDUSA_PRODUCTS, getProductHandle, getCheckoutLocale } from "@/lib/medusa";
import { ProgressStepper } from "@/components/progress-stepper";
import { useTransformation } from "@/lib/transformation-context";
import { useToast } from "@/hooks/use-toast";
import { allStyles, styleData } from "@/lib/styles";
import { addWatermark } from "@/lib/watermark";
import { PRINT_SIZES } from "@/lib/print-prices";
import type { ArtStyle } from "@shared/schema";

const CANVAS_SIZE_LABELS: Record<string, string> = {
  "12x16": '12" x 16"',
  "18x24": '18" x 24"',
  "24x36": '24" x 36"',
  "40x60": '40" x 60"',
};

export default function Result() {
  const [, setLocation] = useLocation();
  const { transformationData, setTransformationData, setPendingStyle } = useTransformation();
  const { toast } = useToast();
  const [showTryAnother, setShowTryAnother] = useState(false);
  const [printSize, setPrintSize] = useState("8x10");
  const [canvasSize, setCanvasSize] = useState("12x16");
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60); // 15 min urgency
  const [purchasingTier, setPurchasingTier] = useState<string | null>(null);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);
  const [watermarkedDisplayUrl, setWatermarkedDisplayUrl] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<{
    digital?: Record<string, number>;
    print?: Record<string, number>;
    handmade?: Record<string, number>;
    digitalOriginal?: number;
  }>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  const category = transformationData?.category ?? "pets";

  useEffect(() => {
    if (!transformationData) {
      setLocation("/tools/dashboard");
    }
  }, [transformationData, setLocation]);

  useEffect(() => {
    if (!USE_MEDUSA_PRODUCTS) {
      setPriceData({});
      setPricesLoading(false);
      return;
    }
    const handle = getProductHandle(category);
    setPricesLoading(true);
    fetch(`/api/art-transform-prices?handle=${encodeURIComponent(handle)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Failed to fetch prices")))
      .then((data: { digital?: Record<string, number>; print?: Record<string, number>; handmade?: Record<string, number>; digitalOriginal?: number }) => {
        setPriceData({
          digital: data.digital ?? {},
          print: data.print ?? {},
          handmade: data.handmade ?? {},
          digitalOriginal: data.digitalOriginal,
        });
      })
      .catch(() => setPriceData({}))
      .finally(() => setPricesLoading(false));
  }, [category]);

  useEffect(() => {
    if (!transformationData?.transformedImage) return;
    let cancelled = false;
    addWatermark(transformationData.transformedImage)
      .then((url) => {
        if (!cancelled) setWatermarkedDisplayUrl(url);
      })
      .catch(() => {
        if (!cancelled) setWatermarkedDisplayUrl(transformationData.transformedImage);
      });
    return () => { cancelled = true; };
  }, [transformationData?.transformedImage]);

  // CRO: Countdown timer for urgency (digital option)
  useEffect(() => {
    const t = setInterval(() => {
      setCountdownSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!transformationData) {
    return null;
  }

  const handlePurchase = async (tier: string, variantOption?: string) => {
    if (USE_MEDUSA_PRODUCTS) {
      const key = `${tier}-${variantOption ?? ""}`;
      setShowCheckoutOverlay(true);
      setPurchasingTier(key);
      toast({ title: "Redirecting to checkout...", description: "Taking you to complete your order." });
      try {
        const type = tier === "HD" ? "digital" : tier === "Print" ? "print" : tier === "Canvas" ? "handmade" : "handmade";
        const size = type === "digital" ? "default" : (variantOption ?? "default");
        const category = transformationData.category ?? "pets";
        const productHandle = getProductHandle(category);
        const res = await fetch("/api/medusa/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productHandle,
            style: transformationData.style,
            type,
            variantOption: size,
            transformationId: transformationData.transformationId,
            locale: getCheckoutLocale(),
          }),
        });
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setShowCheckoutOverlay(false);
        toast({
          variant: "destructive",
          title: "Checkout error",
          description: data.details || data.error || "Could not start checkout. Please try again.",
        });
      } catch (e) {
        console.error("Medusa checkout:", e);
        setShowCheckoutOverlay(false);
        toast({
          variant: "destructive",
          title: "Checkout error",
          description: "Could not start checkout. Please try again.",
        });
        return;
      } finally {
        setShowCheckoutOverlay(false);
        setPurchasingTier(null);
      }
    }
    toast({
      title: "Sign in required",
      description: `Please sign in to purchase the ${tier} version.`,
    });
    window.location.href = "/api/auth/google";
  };

  const handleRetry = () => {
    setTransformationData(null);
    setLocation("/tools/dashboard");
  };

  const handleStyleSelect = (styleId: ArtStyle) => {
    setPendingStyle(styleId);
    setTransformationData(null);
    setLocation("/tools/dashboard");
  };

  const currentStep = hasDownloaded ? "download" : "preview";

  return (
    <div className="min-h-screen bg-background">
      {showCheckoutOverlay && <CheckoutRedirectOverlay />}
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <div className="mb-6">
          <ProgressStepper currentStep={currentStep} />
        </div>

        {/* CRO hierarchy: pricing → title → artwork → formats */}
        <p className="text-center text-sm text-muted-foreground mb-2">
          Preview Free · From $29 to purchase
        </p>
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-display font-display-hero">
            Your Masterpiece is Ready!
          </h1>
        </div>

        <div className="relative mb-8 max-w-2xl mx-auto">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              className="gap-2"
              data-testid="button-retry"
            >
              <RefreshCw className="w-4 h-4" />
              Retry or Edit
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden border shadow-lg relative" onContextMenu={(e) => e.preventDefault()}>
            <ProtectedImage
              src={watermarkedDisplayUrl ?? transformationData.transformedImage}
              alt="Your artwork"
              className="w-full h-auto"
              data-testid="img-transformed"
            />
          </div>
        </div>

        {showTryAnother && (
          <Card className="p-6 mb-8 text-center bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">Try another style?</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {allStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={style.id === transformationData.style ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStyleSelect(style.id)}
                  data-testid={`button-try-style-${style.id}`}
                >
                  {style.name}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* CRO benchmark: Choose Your Format — three cards, clear pricing, benefits, CTAs */}
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Choose Your Format</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* 1. Instant Masterpiece (Digital) — Most Popular */}
          <Card className="p-6 relative border-2 border-primary/30 bg-primary/5">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <div className="text-center mb-4">
              <Download className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-1 font-display">Instant Masterpiece</h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                {pricesLoading ? (
                  <span className="text-3xl font-bold">—</span>
                ) : (
                  <>
                    {priceData.digitalOriginal != null && priceData.digitalOriginal > (priceData.digital?.default ?? 0) && (
                      <span className="text-lg line-through text-muted-foreground">${priceData.digitalOriginal}</span>
                    )}
                    <span className="text-3xl font-bold">
                      {(priceData.digital?.default ?? 0) > 0 ? `$${(priceData.digital?.default ?? 0).toFixed(2)}` : "—"}
                    </span>
                  </>
                )}
              </div>
              {countdownSeconds > 0 && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">
                  Expires in {Math.floor(countdownSeconds / 3600)}:{(Math.floor(countdownSeconds / 60) % 60).toString().padStart(2, "0")}:{(countdownSeconds % 60).toString().padStart(2, "0")}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Instant high-resolution download — perfect for sharing or saving.
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                No Watermark
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Instant Download
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                High-Resolution Portrait
              </li>
            </ul>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => handlePurchase("HD")}
              disabled={!!purchasingTier}
              data-testid="button-buy-hd"
            >
              {purchasingTier === "HD-" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding to cart...
                </>
              ) : (
                "Download Now"
              )}
            </Button>
            <button
              type="button"
              onClick={() => setShowTryAnother(true)}
              className="mt-3 text-xs text-primary hover:underline block w-full text-center"
            >
              Want more styles & masterpieces? View Packs & Pricing →
            </button>
          </Card>

          {/* 2. Fine Art Print */}
          <Card className="p-6">
            <div className="text-center mb-4">
              <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <h3 className="text-xl font-semibold mb-1 font-display">Fine Art Print</h3>
              <span className="text-3xl font-bold">
                {pricesLoading ? "—" : (() => {
                  const p = priceData.print?.[printSize] ?? 0;
                  return p > 0 ? `$${p.toFixed(2)}` : "—";
                })()}
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Printed on museum-quality archival paper with fade-resistant inks.
              </p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
              <Select value={printSize} onValueChange={setPrintSize}>
                <SelectTrigger data-testid="select-print-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRINT_SIZES.map((s) => {
                    const p = priceData.print?.[s.value] ?? 0;
                    return (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label} — {p > 0 ? `$${p.toFixed(2)}` : "—"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <ul className="space-y-2 mb-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Museum-quality archival paper
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Fade-resistant inks
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Made to last decades
              </li>
            </ul>
            <div className="mb-3">
              <FreeShippingBadge deliveryTime="5-7 days" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">+ Includes digital download</p>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => handlePurchase("Print", printSize)}
              disabled={!!purchasingTier}
              data-testid="button-buy-print"
            >
              {purchasingTier === `Print-${printSize}` ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding to cart...
                </>
              ) : (
                "Order Print"
              )}
            </Button>
          </Card>

          {/* 3. Large Canvas — The Perfect Gift */}
          <Card className="p-6 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
              The Perfect Gift 🎁
            </Badge>
            <div className="text-center mb-4">
              <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <h3 className="text-xl font-semibold mb-1 font-display">Large Canvas</h3>
              <span className="text-3xl font-bold">
                {pricesLoading ? "—" : (() => {
                  const p = priceData.handmade?.[canvasSize] ?? 0;
                  return p > 0 ? `$${p.toFixed(2)}` : "—";
                })()}
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Gallery-quality canvas on wood — arrives ready to hang.
              </p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
              <Select value={canvasSize} onValueChange={setCanvasSize}>
                <SelectTrigger data-testid="select-canvas-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["12x16", "18x24", "24x36", "40x60"] as const).map((value) => {
                    const p = priceData.handmade?.[value] ?? 0;
                    return (
                      <SelectItem key={value} value={value}>
                        {CANVAS_SIZE_LABELS[value] ?? value} — {p > 0 ? `$${p.toFixed(2)}` : "—"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <ul className="space-y-2 mb-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Ready to hang
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Cotton-blend canvas, 1.25" thick
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                Mounting included
              </li>
            </ul>
            <div className="mb-3">
              <FreeShippingBadge deliveryTime="2-4 weeks" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">+ Includes digital download</p>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => handlePurchase("Canvas", canvasSize)}
              disabled={!!purchasingTier}
              data-testid="button-buy-canvas"
            >
              {purchasingTier === `Canvas-${canvasSize}` ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding to cart...
                </>
              ) : (
                "Order Canvas"
              )}
            </Button>
          </Card>
        </div>

        <div className="border-t pt-8 mb-8" />

        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-2">
              Want a REAL Hand-Painted Masterpiece?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our master artists create museum-quality oil paintings from your photo.
              Each piece is uniquely crafted with authentic brushwork.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                From $149
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                7-10 day delivery
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-primary" />
                Worldwide shipping
              </span>
            </div>
            <a
              href="https://portraits.art-and-see.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2" data-testid="button-hand-painted">
                Explore Hand-Painted Options
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-0.5 mb-8">
          <div className="flex items-center gap-2">
            <a
              href="https://www.reviews.co.uk/product-reviews/store/art-and-see.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center shrink-0"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0700/2505/2457/files/badge2.gif?v=1764167405"
                alt="Reviews.io Verified Company"
                className="h-8 w-auto object-contain"
                loading="eager"
                decoding="async"
              />
            </a>
            <div className="flex items-center -space-x-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`https://pub-ec72d28400074017a168ab75baec0ff4.r2.dev/avatars/customer${i}.webp`}
                  alt="Happy customer"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full border-2 border-background object-cover shadow-sm"
                />
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <img
                  src="https://cdn.shopify.com/s/files/1/0700/2505/2457/files/reviewsukgif.gif?v=1764164124"
                  alt="5 star rating"
                  className="h-4 w-auto object-contain"
                  loading="eager"
                  decoding="async"
                />
                <span className="text-sm font-bold text-foreground">4.8/5</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Trusted by 2,000+</span> happy customers
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-center mb-4">Send to Friends & Family</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
          <Button variant="outline" size="lg" className="gap-2" data-testid="button-save">
            <Bookmark className="w-4 h-4" />
            Save for Later
          </Button>
          <Button size="lg" className="gap-2" data-testid="button-share">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <Accordion type="single" collapsible className="max-w-xl mx-auto mb-8">
          <AccordionItem value="customers">
            <AccordionTrigger>
              <span className="font-medium">What Customers Say</span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Rated <strong>Excellent</strong> on Reviews.io. Our customers love the quality
                and attention to detail in every piece we create.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="support">
            <AccordionTrigger>
              <span className="font-medium">Need Support?</span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                We're happy to help! Contact us at info@art-and-see.com for any
                questions about your order.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="artists">
            <AccordionTrigger>
              <span className="font-medium">Supporting Real Artists</span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Art & See works with talented artists worldwide. Every hand-painted piece
                supports independent artists and their craft.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-neutral-500 mb-4">AS FEATURED IN</p>
          <div className="flex items-center justify-center gap-6 flex-wrap opacity-40 grayscale">
            <img src="/abc-logo.svg" alt="ABC" width={28} height={28} className="h-7 w-auto" />
            <img src="/nbc-logo.svg" alt="NBC" width={28} height={28} className="h-7 w-auto" />
            <img src="/fox-logo.svg" alt="FOX" width={18} height={18} className="h-[18px] w-auto" />
            <img src="/cw-logo.svg" alt="The CW" width={48} height={20} className="h-5 w-auto" />
            <img src="/ap-logo.svg" alt="Associated Press" width={28} height={28} className="h-7 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
