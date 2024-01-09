import { Box, Toolbar, Typography } from "@mui/material";
import { ScrollContainer } from "../components/ScrollContainer";
import { EmailTextField } from "../components/AppTextField";
import { useAppForm } from "../utils/form";
import { FBFunctionButton } from "../components/FBFunctionButton";

export const InviteUsersContainer = () => {
  const fm = useAppForm<{ email: string }>({ focus: "email" });
  return (
    <ScrollContainer>
      <Toolbar />
      <Typography sx={{ pb: 3 }} variant="h1">
        Invite a new user
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <form>
          <EmailTextField form={fm} fullWidth={false} />
          <FBFunctionButton
            variant="outlined"
            type="submit"
            sx={{ height: "55px" }}
            endpoint="sendInviteToCompany"
            submit={async (e, call) => {
              const handle = fm.handleSubmit(async ({ email }) => {
                await call({ email, admin: false });
                fm.reset();
              });
              await handle(e);
            }}
          >
            Send Invite
          </FBFunctionButton>
        </form>
      </Box>
    </ScrollContainer>
  );
};
