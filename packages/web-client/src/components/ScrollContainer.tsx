import { Grid, GridProps } from "@mui/material";
import { ReactNode } from "react";

export const ScrollContainer = ({
  top,
  bottom,
  children,
  overflow = "auto",
  ...props
}: {
  top?: ReactNode;
  bottom?: ReactNode;
  children: ReactNode;
  overflow?: "auto" | "scroll" | "visible";
} & Partial<Omit<GridProps, "top" | "bottom" | "overflow" | "children">>) => (
  <Grid container direction="column" sx={{ height: "100%" }} {...props}>
    <Grid item>{top}</Grid>
    <Grid item xs overflow={overflow}>
      {children}
    </Grid>
    <Grid item>{bottom}</Grid>
  </Grid>
);
