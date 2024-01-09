import * as React from "react";
import Box from "@mui/material/Box";
import MUIStepper from "@mui/material/Stepper";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ScrollContainer } from "./ScrollContainer";

export type Step = {
  label: string;
  component: React.ReactNode;
  title?: string;
  description?: string;
  notValid?: boolean;
};

export const Stepper = ({
  spacing,
  headerTop,
  contentHeader,
  steps,
  activeStep,
  step,
  handleStep,
  handleBack,
  handleNext,
}: {
  headerTop?: React.ReactNode;
  contentHeader?: React.ReactNode;
  spacing?: number;
  steps: Step[];
  activeStep: number;
  step?: Step;
  handleStep: (step: number) => void;
  handleBack: () => void;
  handleNext: () => void;
}) => {
  return (
    <ScrollContainer
      spacing={spacing}
      onKeyUp={(e) => {
        if (e.key === "Enter") handleNext();
      }}
      top={
        <Grid container spacing={spacing}>
          {headerTop && (
            <Grid item xs={12}>
              {headerTop}
            </Grid>
          )}
          <Grid item xs={12}>
            <MUIStepper nonLinear activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepButton
                    color="inherit"
                    onClick={() => {
                      handleStep(index);
                    }}
                  >
                    {step.label}
                  </StepButton>
                </Step>
              ))}
            </MUIStepper>
          </Grid>
          {step && step.title && (
            <Grid item xs={12}>
              <Typography variant="h1">{step.title}</Typography>
            </Grid>
          )}
          {step && step.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">{step.description}</Typography>
            </Grid>
          )}
        </Grid>
      }
      bottom={
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button onClick={handleNext} sx={{ mr: 1 }} disabled={step?.notValid}>
            {activeStep === steps.length - 1 ? "Complete" : "Next"}
          </Button>
        </Box>
      }
    >
      {contentHeader}
      {step?.component}
    </ScrollContainer>
  );
};
