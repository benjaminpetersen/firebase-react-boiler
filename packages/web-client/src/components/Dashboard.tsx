import Typography, { TypographyProps } from "@mui/material/Typography";
import Grid, { GridProps } from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { UserListContainer } from "../containers/UserListContainer";
import { BigPlusButton } from "./BigPlusCard";
import { useIsAdmin } from "../network/firebase/hooks";

export function Copyright(props: TypographyProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const DashboardGrid = ({
  adminOnly,
  children,
  heightPx = 240,
  ...props
}: GridProps & { adminOnly?: boolean; heightPx?: number }) => {
  const isAdmin = useIsAdmin();
  if (!isAdmin && adminOnly) return null;
  return (
    <Grid {...props}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: heightPx,
        }}
      >
        {children}
      </Paper>
    </Grid>
  );
};

export default function Dashboard() {
  const isAdmin = useIsAdmin();
  return (
    <Grid container spacing={3}>
      {/* New Contract */}
      <DashboardGrid item xs={!isAdmin ? 12 : 6}>
        <BigPlusButton navTo="/new-contract" text="Start a new contract" />
      </DashboardGrid>
      {/* Create a new type */}
      <DashboardGrid item xs={6} adminOnly>
        <BigPlusButton
          navTo="/new-contract-type"
          text="Create a new contract type"
        />
      </DashboardGrid>
      {/* Users */}
      <DashboardGrid item xs={12} adminOnly heightPx={280}>
        <UserListContainer />
      </DashboardGrid>
    </Grid>
  );
}
