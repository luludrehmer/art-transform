import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import heroOilPainting from "@/assets/hero-oil-painting.jpg";

const PastelPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Pastel Style
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Transform your photos into soft, smooth pastel artwork with gentle colors and elegant finish. 
                Perfect for portraits, still life, and sophisticated artistic pieces.
              </p>
              <div className="flex gap-4 mb-8">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/dashboard">
                    <Sparkles className="h-5 w-5" />
                    Try Pastel
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Style Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">70%</p>
                    <p className="text-xs text-muted-foreground">Intensity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">55%</p>
                    <p className="text-xs text-muted-foreground">Texture</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">80%</p>
                    <p className="text-xs text-muted-foreground">Detail</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroOilPainting} 
                alt="Pastel Example"
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Smooth Finish</h3>
                <p className="text-sm text-muted-foreground">
                  Velvety texture with blended pastel effects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Gentle Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Soft, muted palette for elegant artwork
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Refined Detail</h3>
                <p className="text-sm text-muted-foreground">
                  Maintains clarity while adding artistic softness
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PastelPage;
