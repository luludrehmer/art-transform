import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import heroOilPainting from "@/assets/hero-oil-painting.jpg";

const OilPaintingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Oil Painting Style
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Transform your photos into stunning oil paintings with rich textures and classic artistic depth. 
                Perfect for portraits, landscapes, and fine art reproductions.
              </p>
              <div className="flex gap-4 mb-8">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/dashboard">
                    <Sparkles className="h-5 w-5" />
                    Try Oil Painting
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Style Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">85%</p>
                    <p className="text-xs text-muted-foreground">Intensity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">90%</p>
                    <p className="text-xs text-muted-foreground">Texture</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">75%</p>
                    <p className="text-xs text-muted-foreground">Detail</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroOilPainting} 
                alt="Oil Painting Example"
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Rich Textures</h3>
                <p className="text-sm text-muted-foreground">
                  Authentic brush strokes and layered paint effects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Classic Style</h3>
                <p className="text-sm text-muted-foreground">
                  Timeless artistic appeal with museum-quality results
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">High Detail</h3>
                <p className="text-sm text-muted-foreground">
                  Preserves important features while adding artistic flair
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OilPaintingPage;
