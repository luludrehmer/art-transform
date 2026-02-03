import { useState, useEffect, useRef } from "react";
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
import { Upload, Sparkles, Download, RefreshCw, Check, ExternalLink, Share2, Bookmark, Truck, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { allStyles, styleData } from "@/lib/styles";
import { addWatermark } from "@/lib/watermark";
import { useToast } from "@/hooks/use-toast";
import { useCategory, type Category } from "@/lib/category-context";
import type { ArtStyle } from "@shared/schema";

import pets1 from "@/assets/images/pets-1.png";
import pets2 from "@/assets/images/pets-2.png";
import pets3 from "@/assets/images/pets-3.png";
import family1 from "@/assets/images/family-1.png";
import family2 from "@/assets/images/family-2.png";
import family3 from "@/assets/images/family-3.png";
import kids1 from "@/assets/images/kids-1.png";
import kids2 from "@/assets/images/kids-2.png";
import kids3 from "@/assets/images/kids-3.png";
import couples1 from "@/assets/images/couples-1.png";
import couples2 from "@/assets/images/couples-2.png";
import couples3 from "@/assets/images/couples-3.png";
import self1 from "@/assets/images/self-1.png";
import self2 from "@/assets/images/self-2.png";
import self3 from "@/assets/images/self-3.png";

type FlowStep = "upload" | "preview" | "download";

const categoryContent: Record<Category, {
  headline: string;
  subheadline: string;
  uploadText: string;
  images: string[];
  trustText: string;
}> = {
  pets: {
    headline: "The Portrait\nYour Pet Deserves",
    subheadline: "Free Preview · From $29 to purchase",
    uploadText: "Upload one or more pet photos",
    images: [pets1, pets2, pets3],
    trustText: "#1 in Pet Portraits",
  },
  family: {
    headline: "Timeless Family\nPortraits",
    subheadline: "Free Preview · From $29 to purchase",
    uploadText: "Upload a family photo",
    images: [family1, family2, family3],
    trustText: "#1 in Family Portraits",
  },
  kids: {
    headline: "Magical Portraits\nFor Little Ones",
    subheadline: "Free Preview · From $29 to purchase",
    uploadText: "Upload a photo of your child",
    images: [kids1, kids2, kids3],
    trustText: "#1 in Kids Portraits",
  },
  couples: {
    headline: "Romantic Portraits\nFor Two",
    subheadline: "Free Preview · From $29 to purchase",
    uploadText: "Upload a photo of you and your partner",
    images: [couples1, couples2, couples3],
    trustText: "#1 in Couple Portraits",
  },
  "self-portrait": {
    headline: "Your Personal\nMasterpiece",
    subheadline: "Free Preview · From $29 to purchase",
    uploadText: "Upload a photo of yourself",
    images: [self1, self2, self3],
    trustText: "#1 in Self-Portraits",
  },
};

export default function Home() {
  const { toast } = useToast();
  const { activeCategory } = useCategory();
  const resultRef = useRef<HTMLDivElement>(null);
  const content = categoryContent[activeCategory];
  
  const [currentStep, setCurrentStep] = useState<FlowStep>("upload");
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>("oil-painting");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printSize, setPrintSize] = useState("8x10");
  const [canvasSize, setCanvasSize] = useState("12x16");
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    if (currentStep === "preview" || currentStep === "download") {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep]);

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
      
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 95));
      }, 200);

      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl: imageDataUrl,
          style: selectedStyle,
          status: "processing",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Transformation failed");
      }

      const result = await response.json();
      const transformationId = result.transformationId;

      const pollTransformation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 60;

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
                setCurrentStep("preview");
                setCountdown(300);
                
                setTimeout(() => {
                  resultRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
                
                resolve();
              } else if (transformation.status === "failed") {
                reject(new Error("Transformation failed on server"));
              } else if (attempts < maxAttempts) {
                setTimeout(checkStatus, 300);
              } else {
                reject(new Error("Transformation timeout"));
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

  const handleDownloadWatermarked = async () => {
    if (!transformedImage) return;
    
    try {
      setIsWatermarking(true);
      const watermarkedImage = await addWatermark(transformedImage);
      
      const arr = watermarkedImage.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `artwork-${selectedStyle}-preview.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download started",
        description: "Your watermarked preview is downloading",
      });
      setCurrentStep("download");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download. Please try again.",
      });
    } finally {
      setIsWatermarking(false);
    }
  };

  const handlePurchase = (tier: string) => {
    setCurrentStep("download");
    toast({
      title: "Sign in required",
      description: `Please sign in to purchase the ${tier} option.`,
    });
    window.location.href = "/api/auth/google";
  };

  const handleRetry = () => {
    setCurrentStep("upload");
    setTransformedImage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProgress(0);
  };

  const handleTryStyle = (styleId: ArtStyle) => {
    if (selectedFile && previewUrl) {
      setSelectedStyle(styleId);
      setTransformedImage(null);
      setCurrentStep("upload");
      handleTransform(selectedFile, previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/10 border-b py-2 text-center text-sm">
        <span className="mr-4">Free Shipping on Prints</span>
        <span className="mr-4">Rated 4.8★</span>
        <span>#1 on Trustpilot</span>
      </div>

      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
          <span className={cn(currentStep === "upload" ? "text-foreground font-medium" : "")}>
            Upload
          </span>
          <span>&gt;</span>
          <span className={cn(currentStep === "preview" || currentStep === "download" ? "text-foreground font-medium" : "")}>
            Preview
          </span>
          <span>&gt;</span>
          <span className={cn(currentStep === "download" ? "text-foreground font-medium" : "")}>
            Download or Order Print
          </span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif italic whitespace-pre-line">
            {content.headline}
          </h1>
          <p className="text-muted-foreground">
            {content.subheadline}
          </p>
        </div>

        {(currentStep === "upload" || isTransforming) && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Pick Style</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {allStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isTransforming}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedStyle === style.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover-elevate"
                  )}
                  data-testid={`button-style-${style.id}`}
                >
                  {style.name}
                </button>
              ))}
            </div>

            {!isTransforming ? (
              <div
                className="border-2 border-dashed rounded-xl p-12 text-center hover-elevate transition-all cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-input")?.click()}
                data-testid="dropzone-upload"
              >
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{content.uploadText}</h3>
                    <p className="text-sm text-muted-foreground">Use a well-lit photo for best results</p>
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
              <div className="rounded-xl overflow-hidden bg-muted">
                <div className="relative aspect-square max-w-lg mx-auto">
                  {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4 p-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Creating your masterpiece...</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Applying {styleData[selectedStyle]?.name} style
                        </p>
                        <div className="w-48 bg-background/50 rounded-full h-2 mb-2 overflow-hidden mx-auto">
                          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{progress}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {!isTransforming && currentStep === "upload" && (
          <>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-green-600 font-semibold">Excellent</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-green-600 flex items-center justify-center">
                    <span className="text-white text-xs">★</span>
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Trustpilot</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mb-8">{content.trustText}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {content.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-xl overflow-hidden hover-elevate cursor-pointer"
                  data-testid={`gallery-${activeCategory}-${index}`}
                >
                  <img src={image} alt={`${activeCategory} portrait ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </>
        )}

        {(currentStep === "preview" || currentStep === "download") && transformedImage && (
          <div ref={resultRef}>
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold font-serif italic">
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
              <div className="rounded-xl overflow-hidden border shadow-lg relative">
                <img src={transformedImage} alt="Your artwork" className="w-full h-auto" data-testid="img-transformed" />
                <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-8 opacity-20 rotate-[-15deg]">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className="text-lg font-bold text-foreground whitespace-nowrap">ART & SEE</span>
                    ))}
                  </div>
                </div>
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
              <Card className="p-6 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
                <div className="text-center mb-4">
                  <Download className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-1 font-serif">Instant Masterpiece</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg line-through text-muted-foreground">$39</span>
                    <span className="text-3xl font-bold">$29</span>
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
                <Button className="w-full" size="lg" onClick={() => handlePurchase("Instant Masterpiece")} data-testid="button-buy-instant">
                  Download Now
                </Button>
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground mb-1">Want a free preview?</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadWatermarked}
                    disabled={isWatermarking}
                    className="text-xs underline"
                    data-testid="button-download-free"
                  >
                    {isWatermarking ? "Preparing..." : "Download with Watermark (Free)"}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center mb-4">
                  <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-1 font-serif">Fine Art Print</h3>
                  <span className="text-3xl font-bold">$89</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Printed on museum-quality archival paper with fade-resistant inks.
                  </p>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
                  <Select value={printSize} onValueChange={setPrintSize}>
                    <SelectTrigger data-testid="select-print-size"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8x10">8" x 10"</SelectItem>
                      <SelectItem value="11x14">11" x 14"</SelectItem>
                      <SelectItem value="16x20">16" x 20"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Museum-quality archival paper</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Fade-resistant inks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Made to last decades</li>
                </ul>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-2 mb-4 text-sm">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="font-medium">Free Shipping</span>
                  <span className="text-muted-foreground text-xs">($20 value)</span>
                </div>
                <p className="text-xs text-primary mb-2">+ Includes digital download</p>
                <Button variant="outline" className="w-full" size="lg" onClick={() => handlePurchase("Fine Art Print")} data-testid="button-buy-print">
                  Order Print
                </Button>
              </Card>

              <Card className="p-6 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">The Perfect Gift</Badge>
                <div className="text-center mb-4">
                  <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-1 font-serif">Large Canvas</h3>
                  <span className="text-3xl font-bold">$299</span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gallery-quality canvas on wood — arrives ready to hang.
                  </p>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
                  <Select value={canvasSize} onValueChange={setCanvasSize}>
                    <SelectTrigger data-testid="select-canvas-size"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12x16">12" x 16"</SelectItem>
                      <SelectItem value="16x20">16" x 20"</SelectItem>
                      <SelectItem value="24x36">24" x 36"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Ready to hang</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Cotton-blend canvas, 1.25" thick</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Mounting included</li>
                </ul>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-2 mb-4 text-sm">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="font-medium">Free Shipping</span>
                  <span className="text-muted-foreground text-xs">($20 value)</span>
                </div>
                <p className="text-xs text-primary mb-2">+ Includes digital download</p>
                <Button className="w-full bg-primary" size="lg" onClick={() => handlePurchase("Large Canvas")} data-testid="button-buy-canvas">
                  Order Canvas
                </Button>
              </Card>
            </div>

            <div className="text-center mb-8">
              <p className="text-muted-foreground mb-2">Chosen by 10,000+ Art Lovers</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-semibold text-green-600">Excellent</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-green-600 flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Trustpilot</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-center mb-4 font-serif">Send to Friends & Family</h3>
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
                    Rated <strong>Excellent</strong> on Trustpilot. Our customers love the quality and attention to detail.
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
              <p className="text-sm text-muted-foreground mb-4">AS SEEN ON</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-50">
                <span className="text-lg font-serif">The New York Times</span>
                <span className="text-lg font-bold">Forbes</span>
                <span className="text-lg tracking-widest">ELLE</span>
                <span className="text-lg font-serif tracking-widest">VOGUE</span>
              </div>
            </div>

            <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-semibold mb-2 font-serif">
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
