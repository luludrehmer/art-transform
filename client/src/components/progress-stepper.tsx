import { Check, Upload, Palette, Sparkles, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepId = "upload" | "choose" | "transform" | "download";

interface Step {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "choose", label: "Choose Style", icon: Palette },
  { id: "transform", label: "Transform", icon: Sparkles },
  { id: "download", label: "Download", icon: Download },
];

interface ProgressStepperProps {
  currentStep: StepId;
  completedSteps: StepId[];
}

export function ProgressStepper({ currentStep, completedSteps }: ProgressStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto px-4" data-testid="progress-stepper">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPending = index > currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary ring-2 ring-primary ring-offset-2",
                    isPending && "border-border bg-muted text-muted-foreground"
                  )}
                  data-testid={`step-${step.id}`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium text-center",
                    isCurrent && "text-foreground",
                    (isCompleted || isPending) && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="h-0.5 flex-1 mx-2 mt-[-2rem]">
                  <div
                    className={cn(
                      "h-full transition-all",
                      index < currentIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
