import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface CreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreditsDialog = ({ open, onOpenChange }: CreditsDialogProps) => {
  const plans = [
    {
      name: "Starter",
      credits: 10,
      price: "$9",
      pricePerCredit: "$0.90",
      popular: false,
    },
    {
      name: "Creator",
      credits: 50,
      price: "$29",
      pricePerCredit: "$0.58",
      popular: true,
      savings: "Save 36%",
    },
    {
      name: "Professional",
      credits: 200,
      price: "$79",
      pricePerCredit: "$0.40",
      popular: false,
      savings: "Save 56%",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Get More Credits
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose a plan that fits your creative needs
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Current Balance */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">3 Credits</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Free Trial
              </Badge>
            </div>
          </Card>

          {/* Plans Grid */}
          <div className="grid gap-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-4 transition-all hover:shadow-md ${
                  plan.popular
                    ? "border-2 border-primary bg-gradient-to-br from-primary/5 to-background"
                    : "border"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                        {plan.popular && (
                          <Badge variant="default" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        {plan.savings && (
                          <Badge variant="secondary" className="text-xs">
                            {plan.savings}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-primary">
                          {plan.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          / {plan.credits} credits
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.pricePerCredit} per credit
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={plan.popular ? "premium" : "outline"}
                    size="lg"
                    className="flex-shrink-0"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Features */}
          <Card className="p-4 bg-muted/50">
            <h4 className="font-semibold mb-3 text-sm">All plans include:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "High-resolution downloads",
                "Commercial usage rights",
                "Priority processing",
                "No expiration date",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* View All Plans Link */}
          <div className="text-center pt-2">
            <Link
              to="/#pricing"
              onClick={() => onOpenChange(false)}
              className="text-sm text-primary hover:underline"
            >
              View all pricing options →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsDialog;
