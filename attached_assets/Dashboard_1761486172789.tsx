import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProgressStepper from "@/components/ProgressStepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Upload, Sparkles, Image, 
  Wand2, Zap, Download, 
  Eye, Plus, Trash2, 
  Check, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import heroOilPainting from "@/assets/hero-oil-painting.jpg";
import heroAcrylicPainting from "@/assets/hero-acrylic-painting.jpg";
import heroPencilDrawing from "@/assets/hero-pencil-drawing.jpg";

const transformationPresets = [
  {
    id: "oil-painting",
    name: "Oil Painting",
    category: "Classic Art",
    intensity: 85,
    texture: 90,
    detail: 75,
    image: heroOilPainting,
  },
  {
    id: "acrylic-painting",
    name: "Acrylic Art",
    category: "Modern Style",
    intensity: 90,
    texture: 70,
    detail: 80,
    image: heroAcrylicPainting,
  },
  {
    id: "pencil-drawing",
    name: "Pencil Sketch",
    category: "Detailed Lines",
    intensity: 75,
    texture: 40,
    detail: 95,
    image: heroPencilDrawing,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    category: "Soft & Fluid",
    intensity: 80,
    texture: 60,
    detail: 70,
    image: heroAcrylicPainting,
  },
  {
    id: "charcoal",
    name: "Charcoal",
    category: "Bold Strokes",
    intensity: 85,
    texture: 75,
    detail: 85,
    image: heroPencilDrawing,
  },
  {
    id: "pastel",
    name: "Pastel",
    category: "Smooth Finish",
    intensity: 70,
    texture: 55,
    detail: 80,
    image: heroOilPainting,
  },
];

const recentProjects = [
  { id: 1, name: "Portrait_Final", style: "Oil Painting", date: "2h ago" },
  { id: 2, name: "Landscape_v2", style: "Acrylic Art", date: "Yesterday" },
  { id: 3, name: "Pet_Photo", style: "Pencil Sketch", date: "2 days ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState("acrylic-painting");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const credits = 3;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        toast({ 
          title: "Image uploaded", 
          description: "Ready for transformation" 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetChange = (presetId: string) => {
    const preset = transformationPresets.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      toast({ title: "Style selected", description: preset.name });
    }
  };

  const handleTransform = async () => {
    if (!selectedImage) {
      toast({ title: "No image selected", description: "Please upload an image first", variant: "destructive" });
      return;
    }

    // Demo flow - just simulate processing
    setIsProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => prev >= 95 ? prev : prev + 5);
    }, 100);

    setTimeout(() => {
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => {
        setIsProcessing(false);
        navigate("/result");
      }, 300);
    }, 2000);
  };

  const removeImage = () => {
    setSelectedImage(null);
    toast({ title: "Image removed" });
  };

  const transformSteps = [
    { 
      id: "upload", 
      label: "Upload Photo", 
      description: "Select images to transform into art",
      href: "/dashboard" 
    },
    { 
      id: "style", 
      label: "Choose Style", 
      description: "Pick your artistic transformation style",
      href: "/dashboard" 
    },
    { 
      id: "transform", 
      label: "Transform", 
      description: "AI processes your image into artwork"
    },
    { 
      id: "result", 
      label: "Download", 
      description: "Get your final artwork"
    },
  ];

  const currentStep = !selectedImage ? 0 : 1;
  const canProceed = Boolean(selectedImage && activePreset);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <ProgressStepper 
          currentStep={currentStep} 
          steps={transformSteps}
          onTransform={handleTransform}
          canProceed={canProceed}
        />
        
        {/* Workspace Container */}
        <div className="h-[calc(100vh-64px-57px)] flex">
          {/* Left Sidebar - Styles */}
          <div className="w-64 border-r bg-muted/30 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2.5">
              {/* Style Presets */}
              <Label className="text-xs font-medium mb-2 block px-1">Choose Your Style</Label>
              <div className="space-y-1.5">
                {transformationPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className={`w-full group relative overflow-hidden rounded-lg transition-all cursor-pointer hover:scale-[1.01] ${
                      activePreset === preset.id
                        ? 'ring-3 ring-primary shadow-xl shadow-primary/30 scale-[1.02]'
                        : 'ring-1 ring-border hover:ring-2 hover:ring-primary/40'
                    }`}
                  >
                    <div className="aspect-[16/10] relative">
                      <img
                        src={preset.image}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="font-semibold text-foreground text-xs leading-tight">{preset.name}</p>
                            <p className="text-[9px] text-muted-foreground">{preset.category}</p>
                          </div>
                          {activePreset === preset.id && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                              <Check className="h-3 w-3 text-primary-foreground font-bold" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Canvas Content */}
            <div className="flex-1 overflow-auto p-6">
              {!selectedImage ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Upload Your Images</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose images to transform with artistic styles. JPG, PNG, and WebP supported.
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <label htmlFor="file-upload">
                      <Button size="default" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Images
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-3">
                      or drag and drop here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="max-w-2xl w-full overflow-hidden">
                    <div className="aspect-video relative group">
                      <img
                        src={selectedImage}
                        alt="Uploaded image"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button 
                          size="lg" 
                          variant="secondary"
                          onClick={removeImage}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border-t bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Your Image</p>
                          <p className="text-xs text-muted-foreground">
                            {transformationPresets.find(p => p.id === activePreset)?.name} style selected
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
                <Card className="w-80 p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Processing Your Images</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Applying your selected style...
                    </p>
                    <Progress value={progress} className="mb-3" />
                    <p className="text-xs font-medium">{progress}%</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;