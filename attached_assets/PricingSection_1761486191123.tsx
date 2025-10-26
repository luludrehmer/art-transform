import { Check, TrendingUp, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    price: "$10",
    credits: "50 credits",
    pricePerCredit: "$0.20",
    description: "Perfect for trying out our tools",
    icon: Sparkles,
    features: [
      "50 AI transformations",
      "Standard quality (1920px)",
      "All 3 transformation styles",
      "Download high-res images",
      "Basic email support",
    ],
    savings: null,
  },
  {
    name: "Popular",
    price: "$50",
    credits: "300 credits",
    pricePerCredit: "$0.17",
    description: "Best value for regular users",
    popular: true,
    icon: TrendingUp,
    features: [
      "300 AI transformations",
      "Premium quality (2400px)",
      "All 3 transformation styles",
      "Priority processing",
      "Download ultra high-res",
      "Priority email support",
      "Early access to features",
    ],
    savings: "Save 15%",
  },
  {
    name: "Pro",
    price: "$100",
    credits: "700 credits",
    pricePerCredit: "$0.14",
    description: "Maximum value for power users",
    icon: Crown,
    features: [
      "700 AI transformations",
      "Ultra quality (3000px)",
      "All 3 transformation styles",
      "Instant priority processing",
      "Download ultra high-res",
      "Priority support (24h)",
      "Early access to features",
      "Commercial license",
      "API access (coming soon)",
    ],
    savings: "Save 30%",
  },
];

const PricingSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Limited Time Offer</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-2">
            Choose the plan that fits your needs. All plans include access to every transformation tool.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">💳 No subscription.</span> Pay once, use anytime. Credits never expire.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative rounded-xl border-2 transition-all hover:scale-[1.01] ${
                plan.popular
                  ? "border-primary shadow-[var(--shadow-lg)] scale-[1.02]"
                  : "border-border hover:border-primary/30 hover:shadow-[var(--shadow-md)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-bold shadow-[var(--shadow-sm)]">
                    🔥 MOST POPULAR
                  </Badge>
                </div>
              )}
              
              {plan.savings && (
                <div className="absolute -top-2.5 -right-2.5 z-10">
                  <Badge className="bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-bold rotate-12 shadow-[var(--shadow-sm)]">
                    {plan.savings}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-5 pt-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <plan.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      / {plan.credits}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only {plan.pricePerCredit} per transformation
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button
                  variant={plan.popular ? "hero" : "default"}
                  size="default"
                  className="w-full"
                >
                  Get Started Now
                </Button>
                
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-foreground">Everything included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
