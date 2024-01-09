import { Box, Divider, Grid, Hidden, Paper } from "@mui/material";
import { SignUpContainer } from "../containers/SignUpContainer";
import { GoogleSigninContainer } from "../containers/GoogleSigninContainer";
import { SignInContainer } from "../containers/SignInContainer";

export const SignInUp = () => {
  return (
    <Paper sx={{ height: "100vh", width: "100vw" }}>
      <Grid container>
        <Hidden smDown>
          <Grid item sm={6}>
            MARKETING CONTENT
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 3, mt: 5 }}>
            <Box sx={{ p: 3 }}>
              <GoogleSigninContainer style={{ width: "100%" }} />
            </Box>
            <Divider />
            <SignUpContainer />
            <Divider />
            <SignInContainer />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
