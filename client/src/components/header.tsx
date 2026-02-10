import { Link, useLocation } from "wouter";
import { Crown, LogOut, User, PawPrint, Users, Smile, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCategory } from "@/lib/category-context";
import { cn } from "@/lib/utils";
import { MenuButton } from "./navigation-drawer";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeCategory, setActiveCategory } = useCategory();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto grid h-16 max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="justify-self-start" data-testid="link-home">
          <img
            src="/logo3.png"
            alt="Shooting Star"
            className="h-[3.8rem] w-auto object-contain"
          />
        </Link>

        <nav
          className="flex items-center justify-center justify-self-center"
          aria-label="Categories"
        >
          <div className="flex items-center gap-1 rounded-full border bg-nav-pill-bg p-1">
            <Button
              variant={activeCategory === "pets" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full gap-2",
                activeCategory !== "pets" && "text-muted-foreground"
              )}
              onClick={() => setActiveCategory("pets")}
              data-testid="button-category-pets"
            >
              <PawPrint className="w-4 h-4" />
              Pets
            </Button>
            <Button
              variant={activeCategory === "family" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full gap-2",
                activeCategory !== "family" && "text-muted-foreground"
              )}
              onClick={() => setActiveCategory("family")}
              data-testid="button-category-family"
            >
              <Users className="w-4 h-4" />
              Family
            </Button>
            <Button
              variant={activeCategory === "kids" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full gap-2",
                activeCategory !== "kids" && "text-muted-foreground"
              )}
              onClick={() => setActiveCategory("kids")}
              data-testid="button-category-kids"
            >
              <Smile className="w-4 h-4" />
              Kids
            </Button>
            <Button
              variant={activeCategory === "couples" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full gap-2 hidden md:inline-flex",
                activeCategory !== "couples" && "text-muted-foreground"
              )}
              onClick={() => setActiveCategory("couples")}
              data-testid="button-category-couples"
            >
              <Heart className="w-4 h-4" />
              Couples
            </Button>
            <Button
              variant={activeCategory === "self-portrait" ? "default" : "ghost"}
              size="sm"
              className={cn(
                "rounded-full gap-2 hidden md:inline-flex",
                activeCategory !== "self-portrait" && "text-muted-foreground"
              )}
              onClick={() => setActiveCategory("self-portrait")}
              data-testid="button-category-self-portrait"
            >
              <User className="w-4 h-4" />
              Self
            </Button>
          </div>
        </nav>

        <div className="flex justify-self-end items-center gap-3">
          {isAuthenticated && user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold" data-testid="text-credits">
                {user.credits} {user.credits === 1 ? 'Credit' : 'Credits'}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 w-9 rounded-full" 
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={user.profileImageUrl || undefined} 
                      alt={user.email || "User"} 
                    />
                    <AvatarFallback>
                      {user.email ? user.email.substring(0, 2).toUpperCase() : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email || 'My Account'}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a 
                    href="/api/logout" 
                    className="flex items-center cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <MenuButton onClick={onMenuClick} />
        </div>
      </div>
    </header>
  );
}
