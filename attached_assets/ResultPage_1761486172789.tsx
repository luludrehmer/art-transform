import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import ProgressStepper from "@/components/ProgressStepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Sparkles, ArrowRight, Palette, Check, ArrowDown, Paintbrush } from "lucide-react";
import heroOilPainting from "@/assets/hero-oil-painting.jpg";
import heroAcrylicPainting from "@/assets/hero-acrylic-painting.jpg";
import heroPencilDrawing from "@/assets/hero-pencil-drawing.jpg";
import customer1 from "@/assets/customer-1.jpg";
import customer2 from "@/assets/customer-2.jpg";
import customer3 from "@/assets/customer-3.jpg";
import customer4 from "@/assets/customer-4.jpg";

const ResultPage = () => {
  const navigate = useNavigate();
  
  // Get data from sessionStorage
  const getTransformData = () => {
    const data = sessionStorage.getItem('transformData');
    if (data) {
      return JSON.parse(data);
    }
    return null;
  };

  const transformData = getTransformData();
  const originalImage = transformData?.originalImage;
  const toolType = transformData?.toolType;

  useEffect(() => {
    if (!originalImage) {
      navigate("/");
    }
  }, [originalImage, navigate]);

  const getResultImage = () => {
    switch (toolType) {
      case "oil-painting":
        return heroOilPainting;
      case "acrylic-painting":
        return heroAcrylicPainting;
      case "pencil-drawing":
        return heroPencilDrawing;
      default:
        return heroOilPainting;
    }
  };

  const getToolName = () => {
    switch (toolType) {
      case "oil-painting":
        return "Oil Painting";
      case "acrylic-painting":
        return "Acrylic Painting";
      case "pencil-drawing":
        return "Pencil Drawing";
      default:
        return "Oil Painting";
    }
  };

  if (!originalImage) return null;

  const transformSteps = [
    { 
      id: "upload", 
      label: "Upload Photo", 
      description: "Select images to transform into art",
      href: "/dashboard" 
    },
    { 
      id: "style", 
      label: "Choose Style", 
      description: "Pick your artistic transformation style",
      href: "/dashboard" 
    },
    { 
      id: "transform", 
      label: "Transform", 
      description: "AI processes your image into artwork"
    },
    { 
      id: "result", 
      label: "Download", 
      description: "Get your final artwork"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProgressStepper currentStep={3} steps={transformSteps} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Hero Success Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Check className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Complete</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Your {getToolName()} is Ready
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Download your digital artwork or explore hand-painted options
          </p>
        </div>

        {/* Result Showcase with Primary Action */}
        <div className="mb-6">
          <Card className="overflow-hidden">
            {/* Side-by-side Comparison */}
            <div className="grid md:grid-cols-2 gap-4 p-6 md:p-8 bg-muted/20">
              {/* Original */}
              <div>
                <Badge variant="outline" className="text-xs mb-3">Original Photo</Badge>
                <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-lg">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Result */}
              <div>
                <Badge className="text-xs mb-3">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Digital {getToolName()}
                </Badge>
                <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-lg">
                  <img
                    src={getResultImage()}
                    alt="Result"
                    className="w-full h-full object-cover"
                  />
                </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="px-6 md:px-8 py-6 bg-background border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="default" className="flex-1 sm:flex-none sm:min-w-[200px] h-12">
                <Download className="h-4 w-4 mr-2" />
                Download Digital Art
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-none h-12">
                <Palette className="h-4 w-4 mr-2" />
                Try Another Style
              </Button>
            </div>
          </div>

          {/* Arrow Separator */}
          <div className="flex items-center justify-center py-6 bg-background border-y">
            <div className="text-center max-w-2xl mx-auto">
              <ArrowDown className="h-6 w-6 text-primary animate-bounce mx-auto mb-3" />
              <p className="text-base md:text-lg font-bold text-foreground uppercase tracking-wide">
                Get an actual hand-painted version of this artwork made by our expert team of real artists
              </p>
            </div>
          </div>

          {/* Combined Educational Module - Digital vs Hand-Painted */}
          <div className="p-6 md:p-8 bg-gradient-to-b from-background to-primary/5">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left: Educational Copy */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2">
                    Wait—This Can Be Hand-Painted on Real Canvas
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium mb-4">
                    Most people miss this option entirely.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    What you downloaded is <span className="font-semibold text-foreground">digital</span>—great for screens. 
                    But you can get this <span className="font-semibold text-foreground">hand-painted on actual canvas</span> by real artists.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Real brushstrokes. Paint texture you can touch. A physical artwork for your wall—not just pixels. 
                    A genuine heirloom lasting 100+ years.
                  </p>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-col sm:flex-row items-start gap-3 pb-6 border-b">
                  <div className="flex -space-x-3">
                    <img
                      src={customer1}
                      alt="Customer"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover ring-2 ring-white"
                    />
                    <img
                      src={customer2}
                      alt="Customer"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover ring-2 ring-white"
                    />
                    <img
                      src={customer3}
                      alt="Customer"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover ring-2 ring-white"
                    />
                    <img
                      src={customer4}
                      alt="Customer"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover ring-2 ring-white"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">2,347+ customers upgraded to hand-painted</p>
                    <p className="text-xs text-muted-foreground">⭐ 4.9/5 average rating</p>
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="grid gap-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Real Paint You Can Touch</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Museum-Quality Canvas (100+ Year Lifespan)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Hand-Painted by Real Artists</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Ships Ready to Hang</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <Button size="lg" className="w-full mb-2" asChild>
                    <a href="https://portraits.art-and-see.com" target="_blank" rel="noopener noreferrer" className="group">
                      <Paintbrush className="h-4 w-4 mr-2" />
                      See Hand-Painted Pricing & Options
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    View sizes, pricing, artist portfolios & customer paintings
                  </p>
                </div>
              </div>

              {/* Right: Video */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Watch Artists at Work</h4>
                  <p className="text-xs text-muted-foreground">See the actual process—how your portrait gets created</p>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?mute=1&controls=1&rel=0&modestbranding=1"
                    title="Artists hand-painting portraits"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
    </div>
  );
};

export default ResultPage;
