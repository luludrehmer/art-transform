import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Upload, Palette, Download, Check, Star, Crown, Shield, Clock } from "lucide-react";
import { allStyles } from "@/lib/styles";
import heroImage from "@assets/generated_images/Hero_transformation_showcase_f3d8c19c.png";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="container relative px-4 mx-auto">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="px-4 py-1.5" data-testid="badge-free-credits">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Get 3 Free Credits
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Transform Your Photos into{" "}
              <span className="text-gradient">Stunning Artwork</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Turn ordinary photos into extraordinary art with AI-powered transformations. 
              Choose from oil paintings, watercolors, sketches, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/tools/convert-photo-to-painting-online-free">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-get-started">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-see-examples">
                See Examples
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
                src={heroImage} 
                alt="Art transformation showcase" 
                className="w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your photos into art in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center" data-testid="card-step-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>1. Upload Your Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Choose any photo from your device. We support JPG, PNG, and more.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="card-step-2">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>2. Choose Your Style</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Select from 6 artistic styles including oil painting, watercolor, and more.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center" data-testid="card-step-3">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>3. Download Your Art</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get your transformed artwork in seconds. High-resolution, ready to print.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Transformation Styles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from six stunning artistic styles to transform your photos
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
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Intensity</span>
                      <span className="font-medium">{style.intensity}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Texture</span>
                      <span className="font-medium">{style.texture}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Detail</span>
                      <span className="font-medium">{style.detail}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/tools/convert-photo-to-painting-online-free" className="w-full">
                    <Button variant="outline" className="w-full" data-testid={`button-try-${style.id}`}>
                      Try {style.name}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What People Are Saying</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of artists and creators transforming their photos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Professional Photographer",
                avatar: "SJ",
                rating: 5,
                text: "This tool has revolutionized how I present my work. The oil painting style is absolutely stunning!",
              },
              {
                name: "Michael Chen",
                role: "Graphic Designer",
                avatar: "MC",
                rating: 5,
                text: "I use ArtTransform for all my client projects. The quality is consistently amazing and saves me hours.",
              },
              {
                name: "Emma Williams",
                role: "Art Teacher",
                avatar: "EW",
                rating: 5,
                text: "My students love seeing their photos transformed. It's a great way to teach artistic styles!",
              },
              {
                name: "David Martinez",
                role: "Content Creator",
                avatar: "DM",
                rating: 5,
                text: "The watercolor effect is my favorite. Perfect for creating unique social media content.",
              },
              {
                name: "Lisa Anderson",
                role: "Interior Designer",
                avatar: "LA",
                rating: 5,
                text: "I create custom artwork for my clients using this. The results are gallery-worthy.",
              },
              {
                name: "James Taylor",
                role: "Marketing Manager",
                avatar: "JT",
                rating: 5,
                text: "Game changer for our marketing campaigns. High-quality artistic visuals in seconds.",
              },
            ].map((testimonial, index) => (
              <Card key={index} data-testid={`card-testimonial-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card data-testid="card-pricing-starter">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>Perfect for personal use</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["10 credits per month", "All 6 art styles", "High-resolution downloads", "Email support"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" data-testid="button-pricing-starter">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-primary shadow-lg relative" data-testid="card-pricing-popular">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>For professionals and creators</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["50 credits per month", "All 6 art styles", "High-resolution downloads", "Priority support", "Commercial license", "Custom watermark removal"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" data-testid="button-pricing-pro">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            
            <Card data-testid="card-pricing-enterprise">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>For teams and agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {["200 credits per month", "All 6 art styles", "Ultra high-resolution", "24/7 priority support", "Commercial license", "Team collaboration", "API access", "Custom integrations"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" data-testid="button-pricing-enterprise">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/30">
        <div className="container px-4 mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "How does the credit system work?",
                answer: "Each transformation uses 1 credit. You get 3 free credits when you sign up. Additional credits can be purchased through our pricing plans or pay-as-you-go options.",
              },
              {
                question: "What image formats are supported?",
                answer: "We support all common image formats including JPG, PNG, WEBP, and HEIC. For best results, we recommend high-resolution images (at least 1024x1024 pixels).",
              },
              {
                question: "How long does a transformation take?",
                answer: "Most transformations complete in 5-10 seconds. During peak times, it may take up to 30 seconds. You'll see a progress indicator while your art is being created.",
              },
              {
                question: "Can I use the transformed images commercially?",
                answer: "Free tier images are for personal use only. Pro and Enterprise plans include commercial licenses, allowing you to use the transformed images in your business, client work, or for sale.",
              },
              {
                question: "What resolution are the output images?",
                answer: "Standard plans provide high-resolution outputs matching your input image size (up to 2048x2048). Enterprise plans support ultra high-resolution up to 4096x4096 pixels.",
              },
              {
                question: "Can I get a refund if I'm not satisfied?",
                answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied, contact our support team for a full refund.",
              },
              {
                question: "Do you offer team or volume discounts?",
                answer: "Yes! Enterprise plans support multiple team members. For custom volume pricing or special requirements, please contact our sales team.",
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use industry-standard encryption for all uploads and downloads. Your images are automatically deleted from our servers after 24 hours, and we never use your images for training or any other purpose.",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-6 bg-card">
                <AccordionTrigger className="hover:no-underline text-left" data-testid={`accordion-faq-${index}`}>
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
                Start creating stunning artwork in seconds. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tools/convert-photo-to-painting-online-free">
                <Button size="lg" className="mt-4" data-testid="button-cta-bottom">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-12 bg-card/30">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">ArtTransform</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your photos into stunning artwork with AI-powered transformations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tools/convert-photo-to-painting-online-free">Create Art</Link></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#styles">Art Styles</a></li>
                <li><a href="#examples">Examples</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#api">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#license">License</a></li>
                <li><a href="#cookies">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 ArtTransform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
