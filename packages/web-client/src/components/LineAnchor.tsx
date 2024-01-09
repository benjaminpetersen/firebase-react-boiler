import { AdjustRounded } from "@mui/icons-material";
import { IconButton, IconButtonProps } from "@mui/material";
import { forwardRef } from "react";

export const LineAnchor = forwardRef<
  null | HTMLButtonElement,
  {
    anchStyle: "mid-left" | "inline" | "mid-right";
    AnchIcon?: typeof AdjustRounded;
    iconColor: string;
  } & Omit<IconButtonProps, "color">
>(({ iconColor, anchStyle, AnchIcon = AdjustRounded, ...props }, ref) => {
  return (
    <IconButton
      ref={ref}
      sx={{
        ...(anchStyle === "mid-left" || anchStyle === "mid-right"
          ? {
              position: "absolute",
              top: "50%",
              left: anchStyle === "mid-left" ? 0 : undefined,
              right: anchStyle === "mid-right" ? 0 : undefined,
              transform:
                anchStyle === "mid-left"
                  ? "translate(-50%,-50%)"
                  : "translate(50%,-50%)",
            }
          : {}),
        color: iconColor,
      }}
      {...props}
    >
      <AnchIcon />
    </IconButton>
  );
});
