import { SignedInUserAvatar } from "../components/SignedInUserAvatar";
import { useAuthedUserRD } from "../network/firebase/hooks";
import { RemoteDataRender } from "./RemoteDataRender";
import { CircularProgress } from "@mui/material";

export const SignedInUserAvatarContainer = () => {
  const userRD = useAuthedUserRD();
  return (
    <RemoteDataRender
      remoteData={userRD}
      pending={() => <CircularProgress />}
      success={(user) => (
        <SignedInUserAvatar
          name={user?.displayName || ""}
          avatarUrl={user?.photoURL || undefined}
        />
      )}
    />
  );
};
