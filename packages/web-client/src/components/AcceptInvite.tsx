import { Grid, Paper, Typography } from "@mui/material";
import { AsyncButton } from "./AsyncButton";
import { useForm } from "react-hook-form";
import { EmailTextField, FormTextField } from "./AppTextField";

export type UserInfo = {
  name: string;
  avatarUrl?: string;
  email: string;
};

export const AcceptInvite = ({
  onSubmit,
  companyName,
  fm,
}: {
  onSubmit: () => Promise<void>;
  companyName?: string;
  fm: ReturnType<typeof useForm<UserInfo>>;
}) => {
  return (
    <Paper className="full-size" sx={{ p: 3 }}>
      <Grid container spacing={3} direction="column" component={"form"}>
        <Grid item>
          <Typography variant="h1">
            Setup your profile {companyName ? "with " + companyName : ""}
          </Typography>
        </Grid>
        <Grid item>
          <FormTextField fullWidth label="Name" form={fm} name="name" />
        </Grid>
        <Grid item>
          <FormTextField
            fullWidth
            label="Profile Image"
            name={"avatarUrl"}
            form={fm}
          />
        </Grid>
        <Grid item>
          <EmailTextField fullWidth label="Company Email" form={fm} />
        </Grid>
        <Grid item>
          <AsyncButton
            type="submit"
            fullWidth
            onClick={onSubmit}
            failureMessage=""
          >
            Submit
          </AsyncButton>
        </Grid>
      </Grid>
    </Paper>
  );
};
