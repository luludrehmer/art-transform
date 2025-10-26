import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import AuthDialog from "@/components/AuthDialog";
import CreditsDialog from "@/components/CreditsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname.startsWith('/tool/');
  const isResult = location.pathname === '/result';
  const [authOpen, setAuthOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">
            ArtTransform
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            to="/dashboard" 
            className={`transition-colors ${
              isDashboard 
                ? 'text-primary font-semibold' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              Styles
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/styles/oil-painting" className="cursor-pointer">
                  Oil Painting
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/styles/acrylic-painting" className="cursor-pointer">
                  Acrylic Art
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/styles/pencil-sketch" className="cursor-pointer">
                  Pencil Sketch
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/styles/watercolor" className="cursor-pointer">
                  Watercolor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/styles/charcoal" className="cursor-pointer">
                  Charcoal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/styles/pastel" className="cursor-pointer">
                  Pastel
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link 
            to="/#tools-section" 
            className="transition-colors hover:text-primary text-muted-foreground"
          >
            Tools
          </Link>
          <Link 
            to="/#pricing" 
            className="transition-colors hover:text-primary text-muted-foreground"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Credits Display - More Prominent */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreditsOpen(true)}
            className="gap-2 font-semibold border-primary/30 hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-base">3</span>
            </div>
            <Plus className="h-3 w-3 opacity-60" />
          </Button>

          {/* Auth Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="font-medium"
            onClick={() => setAuthOpen(true)}
          >
            Sign In
          </Button>

          {/* Get Started CTA */}
          {!isDashboard && !isResult && (
            <Button size="sm" variant="premium" className="font-medium" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <CreditsDialog open={creditsOpen} onOpenChange={setCreditsOpen} />
    </header>
  );
};

export default Header;
