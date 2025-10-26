import { Link, useLocation } from "wouter";
import { Sparkles, Crown, LogIn, LogOut, User } from "lucide-react";
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

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">ArtTransform</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" data-testid="link-nav-home">
            <Button
              variant="ghost"
              className={location === "/" ? "text-primary" : "text-muted-foreground"}
              data-testid="button-nav-home"
            >
              Home
            </Button>
          </Link>
          <Link href="/tools/convert-photo-to-painting-online-free" data-testid="link-nav-dashboard">
            <Button
              variant="ghost"
              className={location === "/tools/convert-photo-to-painting-online-free" ? "text-primary" : "text-muted-foreground"}
              data-testid="button-nav-dashboard"
            >
              Create
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
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
          ) : (
            <Button 
              asChild
              size="sm" 
              data-testid="button-signin"
            >
              <a href="/api/auth/google">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Google
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
