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
import { Download, RefreshCw, Check, ExternalLink, Share2, Bookmark, Truck, LogIn } from "lucide-react";
import { ProgressStepper } from "@/components/progress-stepper";
import { useTransformation } from "@/lib/transformation-context";
import { useToast } from "@/hooks/use-toast";
import { allStyles, styleData } from "@/lib/styles";
import { addWatermark } from "@/lib/watermark";
import type { ArtStyle } from "@shared/schema";

export default function Result() {
  const [, setLocation] = useLocation();
  const { transformationData, setTransformationData, setPendingStyle } = useTransformation();
  const { toast } = useToast();
  const [showTryAnother, setShowTryAnother] = useState(false);
  const [printSize, setPrintSize] = useState("8x10");
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isWatermarking, setIsWatermarking] = useState(false);

  useEffect(() => {
    if (!transformationData) {
      setLocation("/tools/dashboard");
    }
  }, [transformationData, setLocation]);

  if (!transformationData) {
    return null;
  }

  const handleDownloadWatermarked = async () => {
    try {
      setIsWatermarking(true);
      
      const watermarkedImage = await addWatermark(transformationData.transformedImage);
      
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

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const styleSlug = transformationData.style.toLowerCase().replace(/\s+/g, '-');
      const timestamp = new Date().toISOString().slice(0,10);
      const extension = mime.split('/')[1];
      link.download = `artwork-${styleSlug}-${timestamp}-preview.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your watermarked preview is downloading",
      });

      setShowTryAnother(true);
      setHasDownloaded(true);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download the artwork. Please try again.",
      });
    } finally {
      setIsWatermarking(false);
    }
  };

  const handlePurchase = (tier: string) => {
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
      <div className="container px-4 py-8 mx-auto max-w-5xl">
        <div className="mb-8">
          <ProgressStepper currentStep={currentStep} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif italic">
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
          <div className="rounded-xl overflow-hidden border shadow-lg relative">
            <img
              src={transformationData.transformedImage}
              alt="Your artwork"
              className="w-full h-auto"
              data-testid="img-transformed"
            />
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 opacity-20 rotate-[-15deg]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="text-lg font-bold text-foreground whitespace-nowrap">
                    ART & SEE
                  </span>
                ))}
              </div>
            </div>
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

        <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Format</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-center mb-4">
              <Download className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-1">Free Download</h3>
              <span className="text-3xl font-bold">FREE</span>
              <p className="text-sm text-muted-foreground mt-2">
                Download with watermark — perfect for testing.
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Instant Download
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No signup required
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="w-4 h-4 text-center">-</span>
                Includes watermark
              </li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg" 
              onClick={handleDownloadWatermarked}
              disabled={isWatermarking}
              data-testid="button-download-free"
            >
              <Download className="w-4 h-4 mr-2" />
              {isWatermarking ? "Preparing..." : "Download"}
            </Button>
          </Card>

          <Card className="p-6 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
              Most Popular
            </Badge>
            <div className="text-center mb-4">
              <Download className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-1">HD No Watermark</h3>
              <span className="text-3xl font-bold">$19</span>
              <p className="text-sm text-muted-foreground mt-2">
                High-resolution download without watermark.
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No Watermark
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                High-Resolution
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Instant Download
              </li>
            </ul>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => handlePurchase("HD")}
              data-testid="button-buy-hd"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to Purchase
            </Button>
          </Card>

          <Card className="p-6">
            <div className="text-center mb-4">
              <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <h3 className="text-xl font-semibold mb-1">Museum-Quality Print</h3>
              <span className="text-3xl font-bold">$79</span>
              <p className="text-sm text-muted-foreground mt-2">
                Archival paper, fade-resistant inks.
              </p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-1 block">Choose Size</label>
              <Select value={printSize} onValueChange={setPrintSize}>
                <SelectTrigger data-testid="select-print-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8x10">8" x 10"</SelectItem>
                  <SelectItem value="11x14">11" x 14"</SelectItem>
                  <SelectItem value="16x20">16" x 20"</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Museum-quality archival paper
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Fade-resistant inks
              </li>
            </ul>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2 mb-4 text-sm">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-medium">Free Shipping</span>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => handlePurchase("Print")}
              data-testid="button-buy-print"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to Purchase
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
                Rated <strong>Excellent</strong> on Trustpilot. Our customers love the quality
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
                We're happy to help! Contact us at support@art-and-see.com for any
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
          <p className="text-sm text-muted-foreground mb-4">AS SEEN ON</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <span className="text-lg font-serif">The New York Times</span>
            <span className="text-lg font-bold">Forbes</span>
            <span className="text-lg tracking-widest">ELLE</span>
            <span className="text-lg font-serif tracking-widest">VOGUE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
