import { Link, useLocation } from "wouter";
import { Sparkles, Crown, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location] = useLocation();
  const [credits] = useState(3);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login successful",
      description: "Welcome back!",
    });
    setLoginOpen(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account created",
      description: "You've received 3 free credits!",
    });
    setSignupOpen(false);
  };

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
          <Link href="/dashboard" data-testid="link-nav-dashboard">
            <Button
              variant="ghost"
              className={location === "/dashboard" ? "text-primary" : "text-muted-foreground"}
              data-testid="button-nav-dashboard"
            >
              Create
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold" data-testid="text-credits">
              {credits} Credits
            </span>
          </div>

          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-login">
              <DialogHeader>
                <DialogTitle>Welcome back</DialogTitle>
                <DialogDescription>
                  Login to access your art transformations
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    data-testid="input-login-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    data-testid="input-login-password"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-login-submit">
                  Login
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-signup">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-signup">
              <DialogHeader>
                <DialogTitle>Create your account</DialogTitle>
                <DialogDescription>
                  Get 3 free credits to start transforming your photos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    data-testid="input-signup-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    data-testid="input-signup-password"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-signup-submit">
                  Create Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
