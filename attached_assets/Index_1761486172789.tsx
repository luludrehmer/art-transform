import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import heroOilPainting from "@/assets/hero-oil-painting.jpg";
import heroAcrylicPainting from "@/assets/hero-acrylic-painting.jpg";
import heroPencilDrawing from "@/assets/hero-pencil-drawing.jpg";
import { Sparkles, Zap, Shield, Heart, ArrowRight, CheckCircle } from "lucide-react";

const tools = [
  {
    title: "Photo to Oil Painting",
    description: "Transform your photos into stunning oil paintings with rich textures and classical beauty. Perfect for portraits and landscapes.",
    image: heroOilPainting,
    href: "/tool/oil-painting",
  },
  {
    title: "Photo to Acrylic Painting",
    description: "Convert your images into vibrant acrylic paintings with bold colors and modern artistic flair.",
    image: heroAcrylicPainting,
    href: "/tool/acrylic-painting",
  },
  {
    title: "Photo to Pencil Drawing",
    description: "Create beautiful pencil sketch portraits with realistic shading and artistic detail.",
    image: heroPencilDrawing,
    href: "/tool/pencil-drawing",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 lg:py-24">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        
        <div className="container mx-auto text-center max-w-5xl relative">
          <div className="inline-flex items-center justify-center gap-2 mb-6 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              AI-Powered Art Transformation • 50,000+ Happy Users
            </span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            <span className="block text-gradient">Transform Photos</span>
            <span className="block mt-1">Into Stunning Art</span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Turn any photo into beautiful oil paintings, acrylic art, or pencil drawings in seconds. 
            <span className="text-foreground font-semibold"> Get 3 free transformations</span> to start your creative journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button 
              variant="hero"
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Creating Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See Examples
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            {[
              { icon: Zap, text: "No credit card required" },
              { icon: Heart, text: "3 free generations" },
              { icon: Shield, text: "Premium quality" },
              { icon: CheckCircle, text: "Instant results" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Three Simple Steps to Amazing Art
            </h2>
            <p className="text-base text-muted-foreground">
              Create professional artwork in under 30 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your Photo",
                description: "Drag and drop or select any photo from your device. We support all common formats.",
                icon: "📸",
              },
              {
                step: "2",
                title: "Choose Your Style",
                description: "Select from oil painting, acrylic painting, or pencil drawing transformations.",
                icon: "🎨",
              },
              {
                step: "3",
                title: "Download & Share",
                description: "Get your high-resolution artwork instantly. Perfect for printing or social media.",
                icon: "⬇️",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-center p-6 rounded-xl border-2 hover:border-primary/40 transition-all hover:shadow-[var(--shadow-lg)] bg-card">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                    {item.icon}
                  </div>
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-display text-base font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-primary/20">
                    <ArrowRight className="w-full h-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools-section" className="py-16 px-4 bg-muted/40">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-xs font-semibold text-primary">Choose Your Style</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Three Powerful Transformations
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Select from our AI-powered tools to create stunning artwork in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <div id="pricing" className="scroll-mt-20">
        <PricingSection />
      </div>

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-radial">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-8 rounded-xl bg-card border-2 shadow-[var(--shadow-lg)]">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Ready to Create <span className="text-gradient">Amazing Art</span>?
            </h2>
            <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join 50,000+ creators transforming their photos into stunning artwork. 
              Start with 3 free transformations—no credit card required.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Creating Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              ✓ No credit card required  •  ✓ 3 free transformations  •  ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-10 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display text-base font-bold">ArtTransform</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Transform your photos into stunning artwork with AI-powered technology. 
                Trusted by thousands of creators worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#tools-section" className="hover:text-primary transition-colors">Tools</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@arttransform.com" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ArtTransform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
