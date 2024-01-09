import { AcceptInvite, UserInfo } from "../components/AcceptInvite";
import { useAuthedUserRD } from "../network/firebase/hooks";
import { RemoteDataRender } from "./RemoteDataRender";
import { firebaseFunction } from "../network/firebase/init";
import { useCompanyId } from "../state/context";
import { appUpdateDoc } from "../network/firebase/api-client";
import { useAppForm } from "../utils/form";
import { RD } from "@chewing-bytes/remote-data";
import { useEffect } from "react";
type FormState = UserInfo;
export const AcceptInviteContainer = ({
  onAccept,
}: {
  onAccept: () => void;
}) => {
  const authRD = useAuthedUserRD();
  const companyId = useCompanyId();
  const fm = useAppForm<FormState>({ focus: "name" });
  const auth = RD.get(authRD);
  useEffect(() => {
    if (auth) {
      const v = fm.getValues();
      if (!v.avatarUrl) fm.setValue("avatarUrl", auth.photoURL || undefined);
      if (!v.email) fm.setValue("email", auth.email || "");
      if (!v.name) fm.setValue("name", auth.displayName || "");
    }
  }, [auth]);
  return (
    <RemoteDataRender
      remoteData={authRD}
      success={(auth) => {
        const onSubmit = fm.handleSubmit(async ({ email, name, avatarUrl }) => {
          if (companyId) {
            await appUpdateDoc("invites", { status: "completed" }, auth.uid);
            await appUpdateDoc(
              "companyUsers",
              {
                email,
                avatarUrl,
                name,
              },
              { companyId },
              auth.uid,
            );
            onAccept();
          }
        });
        return <AcceptInvite onSubmit={onSubmit} fm={fm} />;
      }}
    />
  );
};
