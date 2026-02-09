import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Shield, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="flex-1 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-display">About ArtTransform</h1>
          <p className="text-muted-foreground text-lg">
            Transforming your cherished photos into timeless works of art.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p>
            ArtTransform was born from a simple idea: everyone deserves to see their loved ones 
            immortalized as beautiful works of art. Whether it's your beloved pet, your family, 
            or a special moment captured in time, we use cutting-edge AI technology to transform 
            ordinary photos into extraordinary masterpieces.
          </p>
          <p>
            Our team of artists and engineers have worked together to create an experience that 
            combines the convenience of modern technology with the timeless beauty of classical 
            art styles. From oil paintings to watercolors, from pencil sketches to vibrant acrylics, 
            we offer a range of styles to match your vision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">AI-Powered Art</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Our advanced AI models are trained on millions of artworks to create stunning 
              transformations that capture the essence of each style.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Made with Love</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Every transformation is crafted with care. We treat your photos like the precious 
              memories they are.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Privacy First</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your photos are never stored or shared. We process them securely and delete 
              them after your session.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Results</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Get your preview in seconds. No waiting, no hassle. Try different styles 
              until you find the perfect one.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
