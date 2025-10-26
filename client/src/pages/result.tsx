import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Check, ExternalLink, Play } from "lucide-react";
import { ProgressStepper } from "@/components/progress-stepper";
import { useTransformation } from "@/lib/transformation-context";
import { useToast } from "@/hooks/use-toast";

export default function Result() {
  const [, setLocation] = useLocation();
  const { transformationData } = useTransformation();
  const { toast } = useToast();

  useEffect(() => {
    if (!transformationData) {
      setLocation("/dashboard");
    }
  }, [transformationData, setLocation]);

  if (!transformationData) {
    return null;
  }

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your artwork is being downloaded",
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/20">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-12">
          <ProgressStepper
            currentStep="download"
            completedSteps={["upload", "choose", "transform"]}
          />
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge className="gap-1.5" data-testid="badge-success">
              <Check className="w-3 h-3" />
              Transformation Complete
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">Your Artwork is Ready!</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your photo has been transformed into stunning artwork. Download or try another style.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Before & After Comparison</CardTitle>
              <CardDescription>
                See how your photo has been transformed with {transformationData.styleName} style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Original Photo</div>
                  <div className="rounded-xl overflow-hidden border">
                    <img
                      src={transformationData.originalImage}
                      alt="Original"
                      className="w-full h-auto"
                      data-testid="img-original"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Transformed Artwork
                  </div>
                  <div className="rounded-xl overflow-hidden border shadow-lg">
                    <img
                      src={transformationData.transformedImage}
                      alt="Transformed"
                      className="w-full h-auto"
                      data-testid="img-transformed"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleDownload} data-testid="button-download">
              <Download className="w-5 h-5 mr-2" />
              Download Artwork
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" data-testid="button-try-another">
                <Sparkles className="w-5 h-5 mr-2" />
                Try Another Style
              </Button>
            </Link>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3">Premium Upgrade</Badge>
                  <CardTitle className="text-2xl md:text-3xl mb-2">
                    Turn Your Digital Art Into a Hand-Painted Canvas
                  </CardTitle>
                  <CardDescription className="text-base">
                    Professional artists hand-paint your transformed artwork on premium canvas. 
                    Museum-quality results delivered to your door.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">What's Included</h3>
                  <ul className="space-y-3">
                    {[
                      "Hand-painted by professional artists",
                      "Premium gallery-wrapped canvas",
                      "Museum-quality archival materials",
                      "Ready to hang with mounting hardware",
                      "Certificate of authenticity",
                      "30-day satisfaction guarantee",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-4 flex items-center justify-center border">
                    <div className="text-center p-6">
                      <Play className="w-16 h-16 mx-auto text-primary mb-3" />
                      <p className="text-sm text-muted-foreground">Watch the process</p>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Over 10,000 satisfied customers
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-primary">★</span>
                      ))}
                      <span className="text-sm font-medium ml-2">4.9/5 rating</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1" data-testid="button-order-canvas">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Order Hand-Painted Canvas
                </Button>
                <Button variant="outline" size="lg" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
