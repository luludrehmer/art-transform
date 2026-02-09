import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  PawPrint, 
  Users, 
  Smile, 
  Heart, 
  User,
  DollarSign,
  LogIn,
  Info,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCategory, type Category } from "@/lib/category-context";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: { id: Category; label: string; icon: typeof PawPrint }[] = [
  { id: "pets", label: "Pet Portraits", icon: PawPrint },
  { id: "family", label: "Family Portraits", icon: Users },
  { id: "kids", label: "Children's Portraits", icon: Smile },
  { id: "couples", label: "Couple Portraits", icon: Heart },
  { id: "self-portrait", label: "Self-Portraits", icon: User },
];

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [location] = useLocation();
  const { setActiveCategory } = useCategory();
  const [createExpanded, setCreateExpanded] = useState(true);
  const [policiesExpanded, setPoliciesExpanded] = useState(false);

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          onClick={onClose}
          data-testid="drawer-backdrop"
        />
      )}

      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-background border-l z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        data-testid="navigation-drawer"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            data-testid="button-close-drawer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
          
          <nav className="space-y-1">
            <Link href="/" onClick={handleNavClick}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer",
                  location === "/" && "bg-accent"
                )}
                data-testid="nav-home"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </div>
            </Link>

            <div>
              <button
                onClick={() => setCreateExpanded(!createExpanded)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover-elevate"
                data-testid="nav-create-toggle"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Create</span>
                </div>
                {createExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {createExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover-elevate text-left",
                        location === `/${cat.id}` || (location === "/" && cat.id === "pets") ? "bg-accent" : ""
                      )}
                      data-testid={`nav-category-${cat.id}`}
                    >
                      <cat.icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                      {cat.id === "pets" && (
                        <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-xs bg-amber-400 text-amber-900">
                          New
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pricing" onClick={handleNavClick}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer",
                  location === "/pricing" && "bg-accent"
                )}
                data-testid="nav-pricing"
              >
                <DollarSign className="w-5 h-5" />
                <span>Pricing</span>
              </div>
            </Link>

            <Link href="/signin" onClick={handleNavClick}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer",
                  location === "/signin" && "bg-accent"
                )}
                data-testid="nav-signin"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </div>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Legal & Support</p>
          
          <nav className="space-y-1">
            <Link href="/about" onClick={handleNavClick}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer",
                  location === "/about" && "bg-accent"
                )}
                data-testid="nav-about"
              >
                <Info className="w-5 h-5" />
                <span>About ArtTransform</span>
              </div>
            </Link>

            <Link href="/support" onClick={handleNavClick}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate cursor-pointer",
                  location === "/support" && "bg-accent"
                )}
                data-testid="nav-support"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Get Support</span>
              </div>
            </Link>

            <div>
              <button
                onClick={() => setPoliciesExpanded(!policiesExpanded)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-md hover-elevate"
                data-testid="nav-policies-toggle"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span>Policies</span>
                </div>
                {policiesExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {policiesExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link href="/privacy" onClick={handleNavClick}>
                    <div 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm hover-elevate cursor-pointer",
                        location === "/privacy" && "bg-accent"
                      )}
                      data-testid="nav-privacy"
                    >
                      Privacy Policy
                    </div>
                  </Link>
                  <Link href="/terms" onClick={handleNavClick}>
                    <div 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm hover-elevate cursor-pointer",
                        location === "/terms" && "bg-accent"
                      )}
                      data-testid="nav-terms"
                    >
                      Terms of Service
                    </div>
                  </Link>
                  <Link href="/refunds" onClick={handleNavClick}>
                    <div 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm hover-elevate cursor-pointer",
                        location === "/refunds" && "bg-accent"
                      )}
                      data-testid="nav-refunds"
                    >
                      Refund Policy
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      data-testid="button-menu"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
