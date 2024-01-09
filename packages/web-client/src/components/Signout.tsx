import { Button } from "@mui/material";
import { signOut } from "../network/firebase/functions";
export const Signout = () => {
  return (
    <Button
      onClick={() => {
        signOut();
      }}
    >
      Sign Out
    </Button>
  );
};
