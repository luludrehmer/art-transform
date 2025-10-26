import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProgressStepper from "@/components/ProgressStepper";
import UploadSection from "@/components/UploadSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const toolConfig = {
  "oil-painting": {
    title: "Photo to Oil Painting",
    description: "Transform your photo into a stunning oil painting with rich textures and classical beauty",
  },
  "acrylic-painting": {
    title: "Photo to Acrylic Painting",
    description: "Convert your image into a vibrant acrylic painting with bold colors and modern flair",
  },
  "pencil-drawing": {
    title: "Photo to Pencil Drawing",
    description: "Create a beautiful pencil sketch with realistic shading and artistic detail",
  },
};

const ToolPage = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits] = useState(3); // Dummy credits

  const config = toolConfig[toolId as keyof typeof toolConfig];

  if (!config) {
    navigate("/");
    return null;
  }

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    setIsProcessing(true);
    
    // Simulate processing - use dummy image if none selected
    setTimeout(() => {
      setIsProcessing(false);
      
      // Store data in sessionStorage for reliable transfer
      // Use selected image or a dummy placeholder
      const imageToUse = selectedImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23ddd' width='400' height='400'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EDummy Image%3C/text%3E%3C/svg%3E";
      
      sessionStorage.setItem('transformData', JSON.stringify({
        originalImage: imageToUse,
        toolType: toolId,
        timestamp: Date.now()
      }));
      
      navigate("/result");
    }, 2000);
  };

  const transformSteps = [
    { 
      id: "upload", 
      label: "Upload Photo", 
      description: "Select images to transform into art"
    },
    { 
      id: "style", 
      label: "Choose Style", 
      description: "Pick your artistic transformation style"
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

  const currentStep = isProcessing ? 2 : selectedImage ? 1 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ProgressStepper 
        currentStep={currentStep} 
        steps={transformSteps}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-accent text-accent-foreground">AI Transformation</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{config.title}</h1>
          <p className="text-base text-muted-foreground">{config.description}</p>
        </div>

        {/* Credits Display */}
        <Card className="mb-6 border-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Available Credits</p>
              <p className="text-xl font-bold text-accent">{credits} free transformations</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Buy More Credits
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <div className="mb-6">
          <UploadSection
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
          />
        </div>

        {/* Transform Button */}
        <div className="text-center">
          <Button
            variant="hero"
            size="xl"
            onClick={handleTransform}
            disabled={isProcessing}
            className="min-w-64"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Transforming...
              </>
            ) : (
              "Transform Photo"
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            This will use 1 credit from your account
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolPage;
