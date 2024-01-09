import React from "react";
import { Step, Stepper } from "../components/Stepper";
import { clamp } from "lodash-es";
import { useLocation, useNavigate } from "react-router";

const rePeq = /p=\d+/;
const useParamsP = () => {
  const loc = useLocation();
  const match = rePeq.exec(loc.search)?.[0];
  const p = Number(match?.slice(2));
  return isNaN(p) ? undefined : p;
};

export const StepperContainer = ({
  steps,
  spacing,
  handleCompleted,
  onNav,
  initialStep,
  headerTop,
  contentHeader,
}: {
  steps: Step[];
  spacing?: number;
  handleCompleted?: () => void;
  // Called when we go forward or back
  onNav?: (step: number) => void;
  initialStep?: number;
  headerTop?: React.ReactNode;
  contentHeader?: React.ReactNode;
}) => {
  const totalSteps = steps.length;
  const clampStep = (step: number) => {
    const invalidStep = steps.findIndex((s) => s.notValid);
    const maxValidStep = invalidStep === -1 ? totalSteps - 1 : invalidStep - 1;
    return clamp(step, 0, maxValidStep);
  };
  const urlInitialStep = useParamsP();
  const nav = useNavigate();
  const loc = useLocation();
  const [activeStep, _setActiveStep] = React.useState(
    clampStep(initialStep || urlInitialStep || 0),
  );
  const setActiveStep = (_newStep: number) => {
    const newStep = clampStep(_newStep);
    nav(
      loc.pathname +
        `?${loc.search.replace("?", "").replace(rePeq, "")}p=${newStep}`,
    );
    if (_newStep === totalSteps) {
      handleCompleted?.();
    } else {
      onNav?.(newStep);
      _setActiveStep(newStep);
    }
  };
  const handleStep = (step: number) => {
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Stepper
      spacing={spacing}
      activeStep={activeStep}
      handleBack={handleBack}
      handleNext={handleNext}
      handleStep={handleStep}
      steps={steps}
      step={steps[activeStep]}
      headerTop={headerTop}
      contentHeader={contentHeader}
    />
  );
};
