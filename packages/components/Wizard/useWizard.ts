import { useEffect, useState } from "react";

interface WizardStep<T extends string> {
  index: number | null;
  value: T | null;
}

interface Props<T> {
  steps: Array<T>;
  initializeOnLoad?: boolean;
}

const useWizard = <T extends string>({ steps, initializeOnLoad }: Props<T>) => {
  const [currentStep, setCurrentStep] = useState<WizardStep<T>>({
    index: null,
    value: null,
  });

  useEffect(() => {
    if (initializeOnLoad) {
      setCurrentStep({ index: 0, value: steps[0] });
    }
  }, []);

  const nextStep = () => {
    if (currentStep.index !== null && currentStep.index < steps.length - 1) {
      const newIndex = currentStep.index + 1;
      setCurrentStep({ index: newIndex, value: steps[newIndex] });
    }
  };

  const prevStep = () => {
    if (currentStep.index !== null && currentStep.index > 0) {
      const newIndex = currentStep.index - 1;
      setCurrentStep({ index: newIndex, value: steps[newIndex] });
    }
  };

  const goToStep = (step: number | string) => {
    if (typeof step === "string") {
      const index = steps.findIndex((s) => s === step);
      setCurrentStep({ index, value: steps[index] });
      return;
    }

    setCurrentStep({ index: step, value: steps[step] });
  };

  const resetWizard = () => {
    goToStep(0);
  };

  const endWizard = () => {
    setCurrentStep({ index: null, value: null });
  };

  const hasWizardEnded = () => {
    const index = currentStep.index;
    if (index) {
      return index + 1 === steps.length;
    }

    return false;
  };

  return {
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
    endWizard,
    currentStep,
    isWizardEnded: hasWizardEnded(),
  };
};

export default useWizard;
