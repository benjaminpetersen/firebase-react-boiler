import { Box, Paper, PaperProps } from "@mui/material";

export const PrimaryCard = ({ children, ...props }: PaperProps) => {
  return (
    <Paper
      sx={{
        boxShadow: "0px 2px 6px -1px rgba(52,52,119,0.2)",
        height: "100%",
        width: "100%",
      }}
      {...props}
    >
      <Box p={3} height="100%">
        {children}
      </Box>
    </Paper>
  );
};
