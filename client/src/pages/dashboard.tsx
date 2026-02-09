import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { allStyles, styleData } from "@/lib/styles";
import { ProgressStepper } from "@/components/progress-stepper";
import { useTransformation } from "@/lib/transformation-context";
import { useCategory } from "@/lib/category-context";
import { useToast } from "@/hooks/use-toast";
import type { ArtStyle } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { setTransformationData, pendingStyle, setPendingStyle } = useTransformation();
  const { activeCategory } = useCategory();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(pendingStyle || "oil-painting");
  const [isTransforming, setIsTransforming] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pendingStyle) {
      setSelectedStyle(pendingStyle);
      setPendingStyle(null);
    }
  }, [pendingStyle, setPendingStyle]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleTransform(file, url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleTransform(file, url);
    }
  };

  const handleTransform = async (file: File, url: string) => {
    if (!file || !selectedStyle) return;

    setIsTransforming(true);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const selectedStyleInfo = styleData[selectedStyle];
      
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 600);

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
        throw new Error(errorData.error || "Transformation failed");
      }

      const result = await response.json();
      const transformationId = result.transformationId;

      const pollTransformation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 60;

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
                  category: activeCategory,
                  transformationId,
                });

                setTimeout(() => {
                  setLocation("/result");
                }, 500);
                
                resolve();
              } else if (transformation.status === "failed") {
                const msg = transformation.errorMessage || "Transformation failed on server";
                reject(new Error(msg));
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
      setSelectedFile(null);
      setPreviewUrl(null);
      toast({
        title: "Transformation failed",
        description: error instanceof Error ? error.message : "An error occurred while transforming your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="mb-8">
          <ProgressStepper currentStep="upload" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 font-display font-display-hero">
            Transform Your Photo
            <br />
            Into Art
          </h1>
          <p className="text-muted-foreground">
            Free Preview · From $19 to purchase
          </p>
        </div>

        <div className="border rounded-xl p-6 mb-8 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pick Style</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {allStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedStyle === style.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover-elevate"
                )}
                data-testid={`button-style-${style.id}`}
              >
                {style.name}
              </button>
            ))}
          </div>

          {!isTransforming ? (
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center hover-elevate transition-all cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("file-input")?.click()}
              data-testid="dropzone-upload"
            >
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Upload your photo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use a well-lit photo for best results
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
            <div className="rounded-xl overflow-hidden bg-muted">
              <div className="relative aspect-square max-w-lg mx-auto">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-50"
                    data-testid="img-preview"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Creating your masterpiece...
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Applying {styleData[selectedStyle]?.name} style
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">Usually takes 15–30 seconds</p>
                      <div className="w-48 bg-background/50 rounded-full h-2 mb-2 overflow-hidden mx-auto">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{progress}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-12">
          Free preview · No signup required
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allStyles.slice(0, 3).map((style) => (
            <div
              key={style.id}
              className="aspect-[3/4] rounded-xl overflow-hidden hover-elevate cursor-pointer"
              onClick={() => setSelectedStyle(style.id)}
              data-testid={`gallery-${style.id}`}
            >
              <img
                src={style.image}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
