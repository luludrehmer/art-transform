import { Check, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface Step {
  id: string;
  label: string;
  description: string;
  href?: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps: Step[];
  onTransform?: () => void;
  canProceed?: boolean;
}

const ProgressStepper = ({ 
  currentStep, 
  steps,
  onTransform,
  canProceed 
}: ProgressStepperProps) => {
  const navigate = useNavigate();

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      // Going back - allow navigation
      const step = steps[index];
      if (step.href) {
        navigate(step.href);
      }
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button */}
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStepClick(currentStep - 1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}

          {/* Steps - Centered */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = isCompleted;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable && !isCurrent}
                    className={`
                      group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/50 ring-offset-1'
                          : isCompleted
                          ? 'text-foreground hover:bg-muted cursor-pointer hover:scale-105'
                          : 'text-muted-foreground/50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-200
                        ${
                          isCompleted
                            ? 'bg-primary/20 text-primary'
                            : isCurrent
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground/50'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span>{step.label}</span>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div 
                      className={`
                        w-8 h-[2px] mx-1 transition-colors duration-200 rounded-full
                        ${isCompleted ? 'bg-primary' : 'bg-border'}
                      `} 
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Transform Button */}
          {onTransform && (
            <Button
              size="default"
              onClick={onTransform}
              disabled={!canProceed}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Transform Now</span>
              <span className="sm:hidden">Transform</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressStepper;
