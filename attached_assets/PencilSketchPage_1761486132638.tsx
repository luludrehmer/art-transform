import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import heroPencilDrawing from "@/assets/hero-pencil-drawing.jpg";

const PencilSketchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Pencil Sketch Style
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Convert photos into beautiful pencil drawings with fine lines and incredible detail. 
                Ideal for portraits, technical drawings, and artistic sketches.
              </p>
              <div className="flex gap-4 mb-8">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/dashboard">
                    <Sparkles className="h-5 w-5" />
                    Try Pencil Sketch
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Style Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">75%</p>
                    <p className="text-xs text-muted-foreground">Intensity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">40%</p>
                    <p className="text-xs text-muted-foreground">Texture</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">95%</p>
                    <p className="text-xs text-muted-foreground">Detail</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroPencilDrawing} 
                alt="Pencil Sketch Example"
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Fine Lines</h3>
                <p className="text-sm text-muted-foreground">
                  Delicate pencil strokes with authentic hand-drawn feel
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Maximum Detail</h3>
                <p className="text-sm text-muted-foreground">
                  Preserves even the smallest features and nuances
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Elegant Simplicity</h3>
                <p className="text-sm text-muted-foreground">
                  Clean, timeless aesthetic that never goes out of style
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PencilSketchPage;
