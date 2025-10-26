import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
}

const ToolCard = ({ title, description, image, href }: ToolCardProps) => {
  return (
    <Link to={href} className="group">
      <Card className="overflow-hidden border-2 transition-all hover:shadow-[var(--shadow-lg)] hover:border-primary/50 hover:scale-[1.01] rounded-xl">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
          <Button variant="ghost" size="sm" className="group/btn -ml-3 text-primary hover:text-primary">
            Try it now
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ToolCard;
