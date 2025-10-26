import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Image as ImageIcon, X, Sparkles, Check, Crown, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { allStyles, styleData } from "@/lib/styles";
import { ProgressStepper, type StepId } from "@/components/progress-stepper";
import { useTransformation } from "@/lib/transformation-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ArtStyle } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { setTransformationData } = useTransformation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outOfCreditsOpen, setOutOfCreditsOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);


  const currentStep: StepId = selectedFile ? (selectedStyle ? "transform" : "choose") : "upload";
  const completedSteps: StepId[] = [];
  if (selectedFile) completedSteps.push("upload");
  if (selectedStyle) completedSteps.push("choose");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedStyle(null);
  };

  const handleTransform = async () => {
    if (!selectedFile || !selectedStyle || !previewUrl) return;

    // Check if user is authenticated before transforming
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }

    setIsTransforming(true);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const selectedStyleInfo = styleData[selectedStyle];
      
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 95));
      }, 200);

      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImageUrl: imageDataUrl,
          style: selectedStyle,
          status: "processing",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        
        if (response.status === 403 && errorData.error?.includes("Insufficient credits")) {
          if (progressInterval) {
            clearInterval(progressInterval);
          }
          setIsTransforming(false);
          setProgress(0);
          setOutOfCreditsOpen(true);
          return;
        }
        
        if (response.status === 401) {
          if (progressInterval) {
            clearInterval(progressInterval);
          }
          setIsTransforming(false);
          setProgress(0);
          toast({
            title: "Session expired",
            description: "Please sign in again.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/auth/google";
          }, 500);
          return;
        }
        
        throw new Error(errorData.error || "Transformation failed");
      }

      const result = await response.json();
      const transformationId = result.transformationId;

      const pollTransformation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 15;

          const checkStatus = async () => {
            try {
              attempts++;
              
              const statusResponse = await fetch(`/api/transform/${transformationId}`);
              
              if (!statusResponse.ok) {
                reject(new Error("Failed to check transformation status"));
                return;
              }

              const transformation = await statusResponse.json();

              if (transformation.status === "completed") {
                if (progressInterval) {
                  clearInterval(progressInterval);
                  progressInterval = null;
                }
                setProgress(100);

                setTransformationData({
                  originalImage: imageDataUrl,
                  transformedImage: transformation.transformedImageUrl || selectedStyleInfo.image,
                  style: selectedStyle,
                  styleName: selectedStyleInfo.name,
                });

                setTimeout(() => {
                  setLocation("/result");
                }, 500);
                
                resolve();
              } else if (transformation.status === "failed") {
                reject(new Error("Transformation failed on server"));
              } else if (attempts < maxAttempts) {
                setTimeout(checkStatus, 300);
              } else {
                reject(new Error("Transformation timeout"));
              }
            } catch (error) {
              reject(error);
            }
          };

          checkStatus();
        });
      };

      await pollTransformation();
    } catch (error) {
      console.error("Transformation error:", error);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsTransforming(false);
      setProgress(0);
      toast({
        title: "Transformation failed",
        description: error instanceof Error ? error.message : "An error occurred while transforming your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/20">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-12">
          <ProgressStepper currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 max-w-7xl mx-auto">
          <aside className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Choose Your Style</h3>
              <div className="space-y-2">
                {allStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={cn(
                      "cursor-pointer transition-all hover-elevate",
                      selectedStyle === style.id && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => setSelectedStyle(style.id)}
                    data-testid={`card-select-style-${style.id}`}
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={style.image}
                          alt={style.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm truncate">{style.name}</h4>
                          {selectedStyle === style.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {selectedStyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Style Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Intensity</span>
                      <span className="font-medium">
                        {allStyles.find((s) => s.id === selectedStyle)?.intensity}%
                      </span>
                    </div>
                    <Progress
                      value={allStyles.find((s) => s.id === selectedStyle)?.intensity}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Texture</span>
                      <span className="font-medium">
                        {allStyles.find((s) => s.id === selectedStyle)?.texture}%
                      </span>
                    </div>
                    <Progress
                      value={allStyles.find((s) => s.id === selectedStyle)?.texture}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Detail</span>
                      <span className="font-medium">
                        {allStyles.find((s) => s.id === selectedStyle)?.detail}%
                      </span>
                    </div>
                    <Progress
                      value={allStyles.find((s) => s.id === selectedStyle)?.detail}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          <main>
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Upload Your Photo</CardTitle>
                    <CardDescription>
                      Choose a photo to transform into stunning artwork
                    </CardDescription>
                  </div>
                  {selectedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      data-testid="button-remove-image"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed rounded-xl p-12 text-center hover-elevate transition-all cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById("file-input")?.click()}
                    data-testid="dropzone-upload"
                  >
                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Drop your image here, or click to browse
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        data-testid="input-file"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-xl overflow-hidden bg-muted">
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        className="w-full h-auto"
                        data-testid="img-preview"
                      />
                      {isTransforming && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center space-y-4 max-w-sm p-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                              <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                Creating Your Artwork
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Applying{" "}
                                {allStyles.find((s) => s.id === selectedStyle)?.name}{" "}
                                style...
                              </p>
                              <Progress value={progress} className="mb-2" />
                              <p className="text-xs text-muted-foreground">{progress}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isTransforming && (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="gap-1.5">
                          <ImageIcon className="w-3 h-3" />
                          {selectedFile.name}
                        </Badge>
                        <Badge variant="secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedFile && !isTransforming && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleTransform}
                  disabled={!selectedStyle}
                  data-testid="button-transform"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Transform into {selectedStyle && allStyles.find((s) => s.id === selectedStyle)?.name}
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent data-testid="dialog-login-prompt">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">Sign In Required</DialogTitle>
            <DialogDescription className="text-center">
              Please sign in with Google to transform your photos into stunning artwork. You'll get 3 free credits to start!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  3 free transformation credits
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Access to all 6 artistic styles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  High-quality AI transformations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Save and download your artwork
                </li>
              </ul>
            </div>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => { window.location.href = "/api/auth/google"; }}
              data-testid="button-signin-google"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Out of Credits Modal */}
      <Dialog open={outOfCreditsOpen} onOpenChange={setOutOfCreditsOpen}>
        <DialogContent data-testid="dialog-out-of-credits">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">Out of Credits</DialogTitle>
            <DialogDescription className="text-center">
              You've used all your free credits. Upgrade to continue transforming your photos into stunning artwork.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-semibold mb-2">What you get with more credits:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Unlimited transformations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  All 6 artistic styles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  High-resolution downloads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Priority processing
                </li>
              </ul>
            </div>
            <Button className="w-full" size="lg" data-testid="button-upgrade">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
