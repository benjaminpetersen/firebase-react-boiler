import { Alert, AlertProps, Snackbar, SnackbarProps } from "@mui/material";
import { useState } from "react";

export const AppSnackbar = ({
  severity,
  ...props
}: SnackbarProps & { severity?: AlertProps["severity"] }) => {
  const [closed, setClosed] = useState(false);
  return (
    <Snackbar
      open={closed ? false : Boolean(props.message)}
      onClose={() => {
        setClosed(true);
      }}
      {...props}
    >
      <Alert
        onClose={() => {
          setClosed(true);
        }}
        severity={severity}
      >
        {props.message}
      </Alert>
    </Snackbar>
  );
};
