import { cn } from "@/lib/utils";

export type StepId = "upload" | "preview" | "download";

interface Step {
  id: StepId;
  label: string;
}

const steps: Step[] = [
  { id: "upload", label: "Upload" },
  { id: "preview", label: "Preview" },
  { id: "download", label: "Download or Order Print" },
];

interface ProgressStepperProps {
  currentStep: StepId;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="flex items-center justify-center gap-2 text-sm" data-testid="progress-stepper">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;
        const isPending = index > currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={cn(
                "transition-colors",
                isCurrent && "text-foreground font-medium",
                isCompleted && "text-muted-foreground",
                isPending && "text-muted-foreground/60"
              )}
              data-testid={`step-${step.id}`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="text-muted-foreground/40">{">"}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
