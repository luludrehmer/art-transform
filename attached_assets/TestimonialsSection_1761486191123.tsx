import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Portrait Photographer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5,
    text: "Absolutely stunning results! I've used this for my clients and they're blown away. The oil painting style is so realistic.",
  },
  {
    name: "Michael Chen",
    role: "Digital Artist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    rating: 5,
    text: "The quality is incredible. I've tried many AI art tools, but this one produces the most professional results by far.",
  },
  {
    name: "Emma Williams",
    role: "Gift Shop Owner",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 5,
    text: "My customers love these! I use it to create unique gift products. The pencil drawing style is particularly popular.",
  },
  {
    name: "David Rodriguez",
    role: "Wedding Photographer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    rating: 5,
    text: "Game changer for my business. I offer these as add-ons to wedding packages and couples absolutely love them.",
  },
  {
    name: "Lisa Anderson",
    role: "Art Teacher",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    rating: 5,
    text: "I use this with my students to inspire creativity. The AI transformations spark amazing discussions about art.",
  },
  {
    name: "James Taylor",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    rating: 5,
    text: "Perfect for creating unique marketing materials. The acrylic style gives our brand visuals a distinctive artistic edge.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-semibold text-accent">Trusted by Thousands</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied creators transforming their photos into stunning artwork
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="rounded-2xl border-2 hover:shadow-[var(--shadow-large)] transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              {/* Quote decoration */}
              <div className="absolute -top-1 -right-1 w-16 h-16 bg-accent/5 rounded-full" />
              <Quote className="absolute top-3 right-3 h-6 w-6 text-accent/20" />
              
              <CardContent className="p-6 relative">
                {/* Rating */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/10"
                  />
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { number: "50k+", label: "Happy Users" },
            { number: "200k+", label: "Artworks Created" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "98%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-gradient mb-1">{stat.number}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
