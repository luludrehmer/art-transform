import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
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
import { Upload, Sparkles, Download, RefreshCw, Check, ExternalLink, Share2, Bookmark, Palette, Loader2 } from "lucide-react";
import { FreeShippingBadge } from "@/components/free-shipping-badge";
import { CheckoutRedirectOverlay } from "@/components/checkout-redirect-overlay";
import { ProtectedImage } from "@/components/protected-image";
import { USE_MEDUSA_PRODUCTS, getProductHandle, getCheckoutLocale } from "@/lib/medusa";
import { cn } from "@/lib/utils";
import { allStyles, styleData, handmadeCardContent } from "@/lib/styles";
import { addWatermark } from "@/lib/watermark";
import { optimizeImageForUpload } from "@/lib/image-optimize";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategory, type Category } from "@/lib/category-context";
import { StylePicker } from "@/components/style-picker";
import { getGalleryImages } from "@/lib/gallery-images";
import { PRINT_SIZES } from "@/lib/print-prices";
import { resolveStylePresetPrompt, type StylePresetId } from "@/lib/style-presets";
import {
  MOOD_SLUG_TO_ID,
  getMoodSlugForUrl,
  isValidMoodSlug,
  isValidStyleId,
} from "@/lib/url-variants";
import type { ArtStyle } from "@shared/schema";

type FlowStep = "upload" | "preview" | "download";

const HANDMADE_SIZE_ORDER = ["12x16", "18x24", "24x36", "40x60"] as const;
const HANDMADE_SIZE_LABELS: Record<string, string> = {
  "12x16": '12" x 16"',
  "18x24": '18" x 24"',
  "24x36": '24" x 36"',
  "40x60": '40" x 60"',
};

const categoryContent: Record<Category, {
  categoryTitle: string;
  flowTagline: string;
  headline: string;
  headlineLine1: string;
  headlineLine2: string;
  subheadline: string;
  step1Text: string;
  uploadText: string;
  photoTip: string;
  trustText: string;
}> = {
  pets: {
    categoryTitle: "PET PORTRAITS",
    flowTagline: "Upload → Preview → Download, Print or Paint it",
    headline: "Your Pet, Transformed Into Art",
    headlineLine1: "Your Pet,",
    headlineLine2: "Transformed Into Art",
    subheadline: "Preview Free · From $29 to purchase",
    step1Text: "Choose Your Art Style",
    uploadText: "Share Your Pet's Photo",
    photoTip: "Clear, bright photos work best",
    trustText: "#1 in Handmade Portraits",
  },
  family: {
    categoryTitle: "FAMILY PORTRAITS",
    flowTagline: "Upload → Preview → Download, Print or Paint it",
    headline: "Family Portraits That Last Generations",
    headlineLine1: "Family Portraits",
    headlineLine2: "That Last Generations",
    subheadline: "Preview Free · From $29 to purchase",
    step1Text: "Choose Your Art Style",
    uploadText: "Share Your Family Photo",
    photoTip: "Clear, bright photos work best",
    trustText: "#1 in Handmade Portraits",
  },
  kids: {
    categoryTitle: "KIDS PORTRAITS",
    flowTagline: "Upload → Preview → Download, Print or Paint it",
    headline: "Childhood Moments Transformed Into Art",
    headlineLine1: "Childhood Moments",
    headlineLine2: "Transformed Into Art",
    subheadline: "Preview Free · From $29 to purchase",
    step1Text: "Choose Your Art Style",
    uploadText: "Share Your Child's Photo",
    photoTip: "Clear, bright photos work best",
    trustText: "#1 in Handmade Portraits",
  },
  couples: {
    categoryTitle: "COUPLE PORTRAITS",
    flowTagline: "Upload → Preview → Download, Print or Paint it",
    headline: "Your Love Story, Beautifully Painted",
    headlineLine1: "Your Love Story,",
    headlineLine2: "Beautifully Painted",
    subheadline: "Preview Free · From $29 to purchase",
    step1Text: "Choose Your Art Style",
    uploadText: "Share Your Couple Photo",
    photoTip: "Clear, bright photos work best",
    trustText: "#1 in Handmade Portraits",
  },
  "self-portrait": {
    categoryTitle: "SELF-PORTRAITS",
    flowTagline: "Upload → Preview → Download, Print or Paint it",
    headline: "You, Reimagined As Art",
    headlineLine1: "You,",
    headlineLine2: "Reimagined As Art",
    subheadline: "Preview Free · From $29 to purchase",
    step1Text: "Choose Your Art Style",
    uploadText: "Share Your Photo",
    photoTip: "Clear, bright photos work best",
    trustText: "#1 in Handmade Portraits",
  },
};

export default function Home() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { activeCategory } = useCategory();
  const [, setLocation] = useLocation();
  const params = useParams<{ style?: string; mood?: string }>();
  const resultRef = useRef<HTMLDivElement>(null);
  const content = categoryContent[activeCategory];

  const basePath = activeCategory === "pets" ? "/pets" : `/${activeCategory}`;

  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>("oil-painting");
  const [selectedStylePreset, setSelectedStylePreset] = useState<StylePresetId>("none");

  // Sync URL → state: style and mood (only royal, neoclassical, heritage have a mood segment; classic/smart-pick = no segment)
  useEffect(() => {
    const styleFromUrl = params.style;
    if (styleFromUrl && isValidStyleId(styleFromUrl)) {
      setSelectedStyle(styleFromUrl);
    }
  }, [params.style]);

  useEffect(() => {
    if (params.mood && isValidMoodSlug(params.mood)) {
      setSelectedStylePreset(MOOD_SLUG_TO_ID[params.mood]);
    }
  }, [params.mood]);

  const setSelectedStyleAndUrl = (style: ArtStyle) => {
    setSelectedStyle(style);
    const slug = getMoodSlugForUrl(selectedStylePreset);
    setLocation(slug ? `${basePath}/${style}/${slug}` : `${basePath}/${style}`);
  };

  const handleStylePresetSelect = (presetId: StylePresetId) => {
    setSelectedStylePreset(presetId);
    const slug = getMoodSlugForUrl(presetId);
    setLocation(slug ? `${basePath}/${selectedStyle}/${slug}` : `${basePath}/${selectedStyle}`);
  };

  const [priceData, setPriceData] = useState<{
    digital?: Record<string, number>;
    print?: Record<string, number>;
    handmade?: Record<string, number>;
    digitalOriginal?: number;
  }>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch all prices from Medusa (via API) - prices from DB only, no fallbacks
  useEffect(() => {
    if (!USE_MEDUSA_PRODUCTS) {
      setPriceData({});
      setPricesLoading(false);
      return;
    }
    const handle = getProductHandle(activeCategory);
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
  }, [activeCategory]);

  const handmadeSizes = HANDMADE_SIZE_ORDER.map((value) => ({
    value,
    label: HANDMADE_SIZE_LABELS[value] ?? value,
    price: priceData.handmade?.[value] ?? 0,
  }));
  const printSizes = PRINT_SIZES.map((s) => ({
    ...s,
    price: priceData.print?.[s.value] ?? 0,
  }));
  
  const [currentStep, setCurrentStep] = useState<FlowStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printSize, setPrintSize] = useState("8x10");
  const [handmadeSize, setHandmadeSize] = useState("12x16");
  const [countdown, setCountdown] = useState(300);
  const [transformTipIndex, setTransformTipIndex] = useState(0);
  const [transformationId, setTransformationId] = useState<string | null>(null);
  const [watermarkedDisplayUrl, setWatermarkedDisplayUrl] = useState<string | null>(null);
  const [purchasingTier, setPurchasingTier] = useState<string | null>(null);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);

  const TRANSFORM_TIPS = [
    "Analyzing your photo for best composition...",
    "Applying authentic artist techniques...",
    "Matching colors and brushstrokes...",
    "Almost there — crafting your masterpiece...",
    "Final touches — almost ready!",
  ];

  useEffect(() => {
    if (currentStep === "preview" || currentStep === "download") {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!transformedImage) return;
    let cancelled = false;
    addWatermark(transformedImage)
      .then((url) => {
        if (!cancelled) setWatermarkedDisplayUrl(url);
      })
      .catch(() => {
        if (!cancelled) setWatermarkedDisplayUrl(transformedImage);
      });
    return () => { cancelled = true; };
  }, [transformedImage]);

  useEffect(() => {
    if (!isTransforming) return;
    const tipInterval = setInterval(() => {
      setTransformTipIndex((prev) => (prev + 1) % TRANSFORM_TIPS.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, [isTransforming]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleTransform(file, url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleTransform(file, url);
    }
  };

  const handleTransform = async (file: File, url: string) => {
    if (!file || !selectedStyle) return;

    setIsTransforming(true);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const selectedStyleInfo = styleData[selectedStyle];

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return Math.min(prev + 1.5, 90);
          if (prev < 98) return Math.min(prev + 0.35, 98);
          return prev;
        });
      }, 500);

      let imageDataUrl: string;
      let width: number;
      let height: number;
      try {
        const optimized = await optimizeImageForUpload(file);
        imageDataUrl = optimized.dataUrl;
        width = optimized.width;
        height = optimized.height;
      } catch {
        const reader = new FileReader();
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          const objUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objUrl);
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            reject(new Error("Failed to load image"));
          };
          img.src = objUrl;
        });
        width = dims.width;
        height = dims.height;
      }

      const mediumName = styleData[selectedStyle]?.name ?? "oil painting";
      const stylePresetPrompt = resolveStylePresetPrompt(selectedStylePreset, mediumName, activeCategory);
      if (process.env.NODE_ENV === "development" && stylePresetPrompt) {
        console.log("[transform] preset:", selectedStylePreset, "medium:", mediumName, "prompt preview:", stylePresetPrompt.slice(0, 120) + "…");
      }

      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl: imageDataUrl,
          style: selectedStyle,
          status: "processing",
          category: activeCategory,
          width,
          height,
          ...(stylePresetPrompt && { stylePresetPrompt }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Transformation failed");
      }

      const result = await response.json();
      const transformationId = result.transformationId;

      const pollIntervalMs = 400;
      const maxAttempts = selectedStylePreset && selectedStylePreset !== "none" ? 120 : 60;

      const pollTransformation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;

          const checkStatus = async () => {
            try {
              attempts++;
              const statusResponse = await fetch(`/api/transform/${transformationId}`);
              
              if (!statusResponse.ok) {
                reject(new Error("Failed to check transformation status"));
                return;
              }

              const transformation = await statusResponse.json();

              if (transformation.status === "completed") {
                if (progressInterval) {
                  clearInterval(progressInterval);
                  progressInterval = null;
                }
                setProgress(100);
                setTransformedImage(transformation.transformedImageUrl || selectedStyleInfo.image);
                setTransformationId(transformationId);
                setCurrentStep("preview");
                setCountdown(300);
                
                setTimeout(() => {
                  resultRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
                
                resolve();
              } else if (transformation.status === "failed") {
                const msg = transformation.errorMessage || "Transformation failed on server";
                reject(new Error(msg));
              } else if (attempts < maxAttempts) {
                setTimeout(checkStatus, pollIntervalMs);
              } else {
                reject(new Error("Transformation timeout — mood styles can take longer. Please try again."));
              }
            } catch (error) {
              reject(error);
            }
          };

          checkStatus();
        });
      };

      await pollTransformation();
    } catch (error) {
      console.error("Transformation error:", error);
      if (progressInterval) clearInterval(progressInterval);
      setIsTransforming(false);
      setProgress(0);
      setTransformationId(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast({
        title: "Transformation failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  const handlePurchase = async (tier: string, variantOption?: string) => {
    setCurrentStep("download");
    if (USE_MEDUSA_PRODUCTS) {
      const key = `${tier}-${variantOption ?? ""}`;
      setShowCheckoutOverlay(true);
      setPurchasingTier(key);
      toast({ title: "Redirecting to checkout...", description: "Taking you to complete your order." });
      try {
        const type = tier === "Instant Masterpiece" ? "digital" : tier === "Fine Art Canvas Print" || tier === "Fine Art Print" ? "print" : "handmade";
        const size = type === "digital" ? "default" : (variantOption ?? "default");
        const productHandle = getProductHandle(activeCategory);
        const res = await fetch("/api/medusa/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productHandle,
            style: selectedStyle,
            type,
            variantOption: size,
            transformationId: transformationId ?? undefined,
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
          description: data.details || "Could not start checkout. Please try again.",
        });
      } catch (e) {
        console.error("Medusa checkout:", e);
        setShowCheckoutOverlay(false);
        toast({
          variant: "destructive",
          title: "Checkout error",
          description: "Could not start checkout. Please try again.",
        });
      } finally {
        setShowCheckoutOverlay(false);
        setPurchasingTier(null);
      }
      return;
    }
    toast({
      title: "Sign in required",
      description: `Please sign in to purchase the ${tier} option.`,
    });
    window.location.href = "/api/auth/google";
  };

  const handleRetry = () => {
    setCurrentStep("upload");
    setTransformedImage(null);
    setTransformationId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProgress(0);
  };

  const handleTryStyle = (styleId: ArtStyle) => {
    setSelectedStyleAndUrl(styleId);
    if (selectedFile && previewUrl) {
      setTransformedImage(null);
      setCurrentStep("upload");
      handleTransform(selectedFile, previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showCheckoutOverlay && <CheckoutRedirectOverlay />}
      <div className="container px-4 py-6 mx-auto max-w-5xl">
        <p className="text-center text-xs text-muted-foreground mb-1 md:mb-2">{content.flowTagline}</p>

        {!transformedImage && (
          <div className="text-center mb-2 md:mb-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 font-display font-display-hero text-balance max-w-2xl mx-auto">
              <span className="block">{content.headlineLine1}</span>
              <span className="block">{content.headlineLine2}</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {content.subheadline}
            </p>
          </div>
        )}

        {(currentStep === "upload" || isTransforming) && (
          <Card className="p-3 md:p-4 mb-2 md:mb-3">
            <div className="mb-3 flex justify-start">
              <StylePicker
                selectedStyle={selectedStyle}
                onSelect={setSelectedStyleAndUrl}
                selectedStylePreset={selectedStylePreset}
                onStylePresetSelect={handleStylePresetSelect}
                disabled={isTransforming}
                stepLabel={content.step1Text}
              />
            </div>

            {!isTransforming ? (
              <div
                className="border-2 border-dashed rounded-lg p-4 md:p-5 text-center hover-elevate transition-all cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-input")?.click()}
                data-testid="dropzone-upload"
              >
                <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-0.5">{content.uploadText}</h3>
                    <p className="text-xs text-muted-foreground">{content.photoTip}</p>
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-testid="input-file"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden bg-muted/50 border border-border/50">
                <div className="p-8 md:p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5 animate-pulse">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                    {progress < 15 ? "Preparing your image..." : progress < 70 ? "Creating your masterpiece..." : "Almost ready..."}
                  </h3>
                  <p className="text-base text-muted-foreground mb-1">
                    {progress < 15 ? "Optimizing for best results" : progress < 70 ? `Applying ${styleData[selectedStyle]?.name} style` : "Adding final details"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[2rem] flex items-center justify-center">
                    {TRANSFORM_TIPS[transformTipIndex]}
                  </p>
                  <div className="w-full max-w-xs mx-auto mb-2">
                    <div className="h-2.5 bg-background/60 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">{Math.round(progress)}%</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {!transformedImage && (
          <>
            {/* Mobile: row 1 = avatars left, Trusted by 2,000+ right; row 2 = Reviews.io + #1 category */}
            <div className="md:hidden flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center -space-x-2.5 flex-shrink-0">
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
                <div className="flex flex-col gap-0.5 min-w-0">
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
                  <div className="rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 inline-flex items-center">
                    <span className="text-[10px] font-semibold text-green-800">Trusted by 2,000+</span>
                    <span className="text-[10px] text-green-700 ml-1">happy customers</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 py-0.5">
                <a
                  href="https://www.reviews.co.uk/product-reviews/store/art-and-see.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center shrink-0"
                >
                  <img
                    src="https://cdn.shopify.com/s/files/1/0700/2505/2457/files/badge2.gif?v=1764167405"
                    alt="Reviews.io Verified Company"
                    className="h-7 w-auto object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </a>
                <span className="text-xs text-muted-foreground font-medium">{content.trustText}</span>
              </div>
            </div>
            {/* Desktop: full social proof row */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-2 md:gap-4 py-0.5 mb-0.5">
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
                  <div className="rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 inline-flex items-center">
                    <span className="text-xs font-semibold text-green-800">Trusted by 2,000+</span>
                    <span className="text-xs text-green-700 ml-1">happy customers</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="hidden md:block text-center text-xs text-muted-foreground m-0 mb-4 leading-tight">{content.trustText}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {(isMobile ? getGalleryImages(activeCategory, selectedStyle, selectedStylePreset).slice(0, 2) : getGalleryImages(activeCategory, selectedStyle, selectedStylePreset)).map((image, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-xl overflow-hidden hover-elevate cursor-pointer"
                  data-testid={`gallery-${activeCategory}-${selectedStyle}-${index}`}
                >
                  <img src={image} alt={`${activeCategory} ${selectedStyle} portrait ${index + 1}`} className="w-full h-full object-cover" loading={index < 3 ? "eager" : "lazy"} fetchpriority={index < 3 ? "high" : "low"} />
                </div>
              ))}
            </div>
          </>
        )}

        {(currentStep === "preview" || currentStep === "download") && transformedImage && (
          <div ref={resultRef}>
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold font-display italic">
                Your Masterpiece is Ready!
              </h2>
            </div>

            <div className="relative mb-8 max-w-2xl mx-auto">
              <div className="absolute top-4 right-4 z-10">
                <Button variant="secondary" size="sm" onClick={handleRetry} className="gap-2" data-testid="button-retry">
                  <RefreshCw className="w-4 h-4" />
                  Retry or Edit
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden border shadow-lg relative" onContextMenu={(e) => e.preventDefault()}>
                <ProtectedImage src={watermarkedDisplayUrl ?? transformedImage} alt="Your artwork" className="w-full h-auto" data-testid="img-transformed" />
              </div>
            </div>

            {currentStep === "download" && (
              <Card className="p-6 mb-8 text-center bg-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold mb-4">Want more styles & masterpieces?</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {allStyles.map((style) => (
                    <Button
                      key={style.id}
                      variant={style.id === selectedStyle ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTryStyle(style.id)}
                      data-testid={`button-try-style-${style.id}`}
                    >
                      {style.name}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Format</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 relative card-selected">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
                <div className="text-center mb-4">
                  <Download className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-1 font-display">Instant Masterpiece</h3>
                  <div className="flex items-center justify-center gap-2">
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
                  <p className="text-sm text-primary mt-1">Expires in {formatCountdown(countdown)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Instant high-resolution download — perfect for sharing or saving.
                  </p>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />No Watermark</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Instant Download</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />High-Resolution Portrait</li>
                </ul>
                <Button className="w-full" variant="default" size="lg" onClick={() => handlePurchase("Instant Masterpiece")} disabled={!!purchasingTier} data-testid="button-buy-instant">
                  {purchasingTier === "Instant Masterpiece-" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding to cart...</> : "Download Now"}
                </Button>
              </Card>

              <Card className="p-6">
                <div className="text-center mb-4">
                  <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-1 font-display">Fine Art Canvas Print</h3>
                  <span className="text-3xl font-bold">
                    {pricesLoading ? "—" : (() => {
                      const p = printSizes.find((s) => s.value === printSize)?.price ?? 0;
                      return p > 0 ? `$${p.toFixed(2)}` : "—";
                    })()}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Museum-quality canvas print — stretched, ready to hang.
                  </p>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
                  <Select value={printSize} onValueChange={setPrintSize}>
                    <SelectTrigger data-testid="select-print-size"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {printSizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} — {s.price > 0 ? `$${s.price.toFixed(2)}` : "—"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Stretched, ready to hang</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Cotton-blend canvas, museum-quality</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Made to last decades</li>
                </ul>
                <div className="mb-4">
                  <FreeShippingBadge />
                </div>
                <p className="text-xs text-primary mb-2">+ Includes digital download</p>
                <Button className="w-full" variant="default" size="lg" onClick={() => handlePurchase("Fine Art Canvas Print", printSize)} disabled={!!purchasingTier} data-testid="button-buy-print">
                  {purchasingTier === `Fine Art Canvas Print-${printSize}` ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding to cart...</> : "Order Canvas"}
                </Button>
              </Card>

              <Card className="p-6 relative border-2 border-green-500">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">🎁 The Perfect Gift</Badge>
                <div className="text-center mb-4">
                  <Palette className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-1 font-display">{styleData[selectedStyle].name}</h3>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">from</span>
                    <span className="text-3xl font-bold text-primary">
                      {pricesLoading
                        ? "—"
                        : (() => {
                          const p = handmadeSizes.find((s) => s.value === handmadeSize)?.price ?? 0;
                          return p > 0 ? `$${p.toFixed(2)}` : "—";
                        })()}
                    </span>
                    <Badge variant="secondary" className="bg-foreground text-background">{handmadeCardContent[selectedStyle].badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {handmadeCardContent[selectedStyle].tagline}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Select Size *</label>
                  <Select value={handmadeSize} onValueChange={setHandmadeSize}>
                    <SelectTrigger data-testid="select-handmade-size"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {handmadeSizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label} — {s.price > 0 ? `$${s.price.toFixed(2)}` : "—"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  {handmadeCardContent[selectedStyle].bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary shrink-0" />{bullet}</li>
                  ))}
                </ul>
                <div className="mb-4">
                  <FreeShippingBadge />
                </div>
                <p className="text-xs text-primary mb-2">+ Includes digital download</p>
                <Button className="w-full" variant="default" size="lg" onClick={() => handlePurchase(styleData[selectedStyle].name, handmadeSize)} disabled={!!purchasingTier} data-testid="button-buy-handmade">
                  {purchasingTier === `${styleData[selectedStyle].name}-${handmadeSize}` ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding to cart...</> : `Order ${styleData[selectedStyle].name}`}
                </Button>
              </Card>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 py-4 mb-8">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-sm">Excellent</span>
                <img
                  src="https://cdn.shopify.com/s/files/1/0700/2505/2457/files/reviewsukgif.gif?v=1764164124"
                  alt="5 star rating"
                  className="h-4 w-auto object-contain"
                />
                <span className="font-bold text-foreground text-sm">4.8/5</span>
              </div>
              <a
                href="https://www.reviews.co.uk/product-reviews/store/art-and-see.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0700/2505/2457/files/badge2.gif?v=1764167405"
                  alt="Reviews.io Verified Company"
                  className="h-8 w-auto object-contain"
                />
              </a>
            </div>

            <h3 className="text-xl font-semibold text-center mb-4 font-display">Send to Friends & Family</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
              <Button variant="outline" size="lg" className="gap-2" data-testid="button-save">
                <Bookmark className="w-4 h-4" />Save for Later
              </Button>
              <Button size="lg" className="gap-2" data-testid="button-share">
                <Share2 className="w-4 h-4" />Share
              </Button>
            </div>

            <Accordion type="single" collapsible className="max-w-xl mx-auto mb-8">
              <AccordionItem value="customers">
                <AccordionTrigger><span className="font-medium">What Customers Say</span></AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Rated <strong>Excellent</strong> on Reviews.io. Our customers love the quality and attention to detail.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support">
                <AccordionTrigger><span className="font-medium">Need Support?</span></AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">We're happy to help! Contact us at support@art-and-see.com.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="artists">
                <AccordionTrigger><span className="font-medium">Supporting Real Artists</span></AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Art & See works with talented artists worldwide. Every piece supports independent artists.
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

            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold mb-2 font-display">
                  Want a REAL Hand-Painted Masterpiece?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our master artists create museum-quality oil paintings from your photo.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" />From $149</span>
                  <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" />7-10 day delivery</span>
                  <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" />Worldwide shipping</span>
                </div>
                <a href="https://portraits.art-and-see.com" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2" data-testid="button-hand-painted">
                    Explore Hand-Painted Options<ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
