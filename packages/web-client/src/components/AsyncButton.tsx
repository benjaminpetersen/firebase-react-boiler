import {
  Alert,
  Button,
  ButtonProps,
  CircularProgress,
  Grid,
} from "@mui/material";
import React from "react";
import { CheckCircleOutline, Warning } from "@mui/icons-material";
import { Toast } from "../state/toast";
import { CustomTooltip } from "./CustomTooltip";

export const AsyncButton = ({
  failureMessage,
  feedback = [],
  setFeedback,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  failureMessage?: string;
  feedback?: Toast[];
  setFeedback?: (t: Toast[]) => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const hasErrors = feedback.some((f) => f.severity === "error");
  const isSuccess =
    feedback.length && feedback.every((f) => f.severity === "success");
  return (
    <Button
      {...props}
      onClick={async (e) => {
        if (loading) return;
        setLoading(true);
        setFeedback?.([]);
        try {
          await props.onClick(e);
        } catch (e) {
          failureMessage &&
            setFeedback?.([{ message: failureMessage, severity: "error" }]);
        } finally {
          setLoading(false);
        }
      }}
      startIcon={
        loading ? (
          <CircularProgress color={"primary"} size={"1rem"} />
        ) : feedback.length ? (
          <CustomTooltip
            title={
              <Grid container spacing={2}>
                {feedback.map((m, i) => (
                  <Grid item key={i} xs={12}>
                    <Alert severity={m.severity} key={i}>
                      {m.message || ""}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            }
          >
            {isSuccess ? (
              <CheckCircleOutline color="success" />
            ) : (
              <Warning
                sx={{ width: "1rem" }}
                color={hasErrors ? "error" : "warning"}
              />
            )}
          </CustomTooltip>
        ) : (
          props.startIcon
        )
      }
    />
  );
};
