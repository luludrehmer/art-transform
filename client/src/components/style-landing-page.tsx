import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Sparkles, Zap, Palette, ArrowRight } from "lucide-react";
import { type StyleSEO } from "@shared/seoMetadata";
import { Link } from "wouter";

interface StyleLandingPageProps {
  seoData: StyleSEO;
  styleImage: string;
}

export function StyleLandingPage({ seoData, styleImage }: StyleLandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/20">
      <div className="container px-4 py-12 mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Free AI Transformation
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {seoData.h1}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {seoData.h2Tagline}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link href="/tools/dashboard">
              <Button size="lg" className="gap-2" data-testid="button-try-now">
                <Palette className="w-5 h-5" />
                Try It Free Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              Free to use
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              No watermark
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              Instant results
            </div>
          </div>
        </div>

        {/* Example Preview */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted">
                <img
                  src={styleImage}
                  alt={`${seoData.h1} Example`}
                  className="w-full h-full object-cover"
                  data-testid="img-style-example"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {seoData.features.map((feature, index) => (
              <Card key={index} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Benefits</CardTitle>
              <CardDescription>Why choose our AI converter?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {seoData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Perfect For</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Discover how people use this art style transformation
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {seoData.useCases.map((useCase, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {useCase}
              </Badge>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {seoData.faq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-primary/20">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Photos?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get started for free with 3 transformation credits. No credit card required.
              </p>
              <Link href="/tools/dashboard">
                <Button size="lg" className="gap-2" data-testid="button-cta-start">
                  <Sparkles className="w-5 h-5" />
                  Start Transforming Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
