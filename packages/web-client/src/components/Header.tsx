import { Grid, Typography } from "@mui/material";

export const Header = ({
  children,
  header,
}: {
  header?: React.ReactNode;
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {typeof header === "string" ? (
          <Typography variant="h1">{header}</Typography>
        ) : (
          header
        )}
      </Grid>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <Grid item xs={12} key={i}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
};
