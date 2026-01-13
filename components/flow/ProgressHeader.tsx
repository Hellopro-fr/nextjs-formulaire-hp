"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Step {
  id: number;
  label: string;
}

interface ProgressHeaderProps {
  steps: Step[];
  currentStep: number;
  progress: number;
  onClose?: () => void;
}

const ProgressHeader = ({ steps, currentStep, progress, onClose }: ProgressHeaderProps) => {
  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="border-b border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-4">
        {/* Logo */}
        <div className="h-5 sm:h-8 shrink-0 flex items-center">
          <span className="font-bold text-primary text-lg sm:text-xl">HelloPro</span>
        </div>

        {/* Mobile: Current step indicator - simplified */}
        <div className="flex sm:hidden items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Étape {currentStep}/{steps.length}
          </span>
          <span className="text-xs text-foreground">
            · {currentStepData?.label}
          </span>
        </div>

        {/* Desktop: Full steps */}
        <div className="hidden sm:flex items-center gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  step.id <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="ml-4 h-px w-8 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Close button - icon on mobile, text on desktop */}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-5 w-5 sm:hidden" />
          <span className="hidden sm:inline text-sm">Fermer</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressHeader;
