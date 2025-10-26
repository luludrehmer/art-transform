import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Crown, Shield, Clock, Palette } from "lucide-react";
import type { StyleContent } from "@/lib/style-content";
import type { StyleInfo } from "@shared/schema";

interface StyleLandingTemplateProps {
  content: StyleContent;
  styleInfo: StyleInfo;
}

export function StyleLandingTemplate({ content, styleInfo }: StyleLandingTemplateProps) {
  return (
    <div className="flex flex-col">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="container relative px-4 mx-auto">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="px-4 py-1.5" data-testid="badge-free-style">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Free {styleInfo.name} Transformation
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {content.seoHeadline}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {content.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/tools/convert-photo-to-painting-online-free">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-try-style">
                  <Palette className="w-5 h-5 mr-2" />
                  Try {styleInfo.name} Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-view-examples">
                View Examples
              </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Results in seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span>Professional quality</span>
              </div>
            </div>
            
            <div className="w-full mt-8 rounded-2xl overflow-hidden shadow-2xl border">
              <img 
                src={styleInfo.image} 
                alt={`${styleInfo.name} transformation example`}
                className="w-full h-auto"
                data-testid="img-style-hero"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose {styleInfo.name}?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the unique benefits of transforming your photos with {styleInfo.name.toLowerCase()} style
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {content.benefits.map((benefit, index) => (
              <Card key={index} data-testid={`card-benefit-${index}`}>
                <CardHeader>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <CardDescription className="text-base text-foreground">
                      {benefit}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Style Characteristics</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {styleInfo.description}
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{styleInfo.name} Attributes</CardTitle>
              <CardDescription>
                Technical characteristics that make this style unique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Intensity</span>
                  <span className="text-muted-foreground">{styleInfo.intensity}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${styleInfo.intensity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Texture</span>
                  <span className="text-muted-foreground">{styleInfo.texture}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${styleInfo.texture}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Detail</span>
                  <span className="text-muted-foreground">{styleInfo.detail}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${styleInfo.detail}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perfect For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ideal use cases for {styleInfo.name.toLowerCase()} transformations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {content.useCases.map((useCase, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`card-usecase-${index}`}>
                <CardHeader>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{useCase}</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <Card className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to Transform Your Photos?
              </CardTitle>
              <CardDescription className="text-lg">
                Start creating stunning {styleInfo.name.toLowerCase()} artwork in seconds. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tools/convert-photo-to-painting-online-free">
                <Button size="lg" className="mt-4" data-testid="button-cta-bottom">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try {styleInfo.name} Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
