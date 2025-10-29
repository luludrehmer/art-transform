import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Palette, Download } from "lucide-react";
import { allStyles } from "@/lib/styles";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial opacity-30" />
          <div className="container relative px-4 mx-auto">
            <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
              <Badge variant="secondary" className="px-4 py-1.5" data-testid="badge-free-credits">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Get 3 Free Credits
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Transform Photos into{" "}
                <span className="text-gradient">Stunning Artwork</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                AI-powered photo to art transformation. Choose from 6 artistic styles including oil paintings, watercolors, sketches, and more.
              </p>
              
              <Link href="/tools/dashboard">
                <Button size="lg" data-testid="button-get-started">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card/30">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform your photos
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center" data-testid="card-step-1">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>1. Upload Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Choose any photo from your device
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center" data-testid="card-step-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>2. Select Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Pick from 6 artistic transformation styles
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center" data-testid="card-step-3">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>3. Download Art</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Get your transformed artwork instantly
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Artistic Styles</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from six stunning styles powered by AI
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {allStyles.map((style) => (
                <Card 
                  key={style.id} 
                  className="overflow-hidden hover-elevate transition-all"
                  data-testid={`card-style-${style.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={style.image} 
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{style.name}</CardTitle>
                    <CardDescription>{style.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/tools/dashboard">
                <Button size="lg" data-testid="button-cta-styles">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try It Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">ArtTransform</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © 2025 ArtTransform. All rights reserved.
            </p>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="https://portraits.art-and-see.com/tools/" className="hover:text-foreground transition-colors">
                ← Back to Tools Hub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
