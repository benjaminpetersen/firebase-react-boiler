import { Grid, Typography } from "@mui/material";
import { BigPlusButton } from "./BigPlusCard";
import { useNavToCreateCompany } from "../containers/CompanyHeaderContainer";

export const SelectOrCreateCompany = () => {
  const navToCreate = useNavToCreateCompany();
  return (
    <Grid container spacing={3} justifyContent={"center"}>
      <Grid item xs={12}>
        <Typography variant="h1">Get Started</Typography>
      </Grid>
      <Grid item xs={12}>
        <BigPlusButton
          onClick={() => {
            navToCreate();
          }}
          text="Create a Company"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ textAlignLast: "center" }}>OR</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h1">Join a company</Typography>
        <Typography variant="body1" sx={{ pt: 3 }}>
          To join a company reach out to the owner, they can invite you!
        </Typography>
      </Grid>
    </Grid>
  );
};
