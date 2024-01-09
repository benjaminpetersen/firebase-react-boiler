import { Typography, TypographyProps } from "@mui/material";

export const FallbackGhostTypography = ({
  fallbackText = "N/A",
  ...props
}: TypographyProps & { fallbackText?: string }) => {
  return (
    <>
      {props.children ? (
        <Typography {...props} />
      ) : (
        <Typography {...props}>
          <span style={{ opacity: 0.5 }}>{fallbackText}</span>
        </Typography>
      )}
    </>
  );
};
