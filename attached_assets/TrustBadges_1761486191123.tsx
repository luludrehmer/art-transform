import { Shield, Lock, Award, Zap, Heart, CheckCircle } from "lucide-react";

const TrustBadges = () => {
  return (
    <div className="py-8 px-4 border-y bg-muted/40">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              icon: Shield,
              text: "Secure Payment",
              subtext: "SSL Encrypted",
            },
            {
              icon: Lock,
              text: "Privacy Protected",
              subtext: "Your data is safe",
            },
            {
              icon: Award,
              text: "Premium Quality",
              subtext: "Guaranteed",
            },
            {
              icon: Zap,
              text: "Instant Results",
              subtext: "2-5 seconds",
            },
            {
              icon: Heart,
              text: "98% Satisfaction",
              subtext: "50k+ users",
            },
            {
              icon: CheckCircle,
              text: "Money Back",
              subtext: "30-day guarantee",
            },
          ].map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <badge.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-xs mb-0.5">{badge.text}</p>
              <p className="text-xs text-muted-foreground">{badge.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
