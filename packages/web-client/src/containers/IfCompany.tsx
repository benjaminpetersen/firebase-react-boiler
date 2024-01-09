import { RD, RemoteData } from "@chewing-bytes/remote-data";
import { HeaderSidebar } from "../layout/HeaderSidebar";
import { AcceptInviteContainer } from "./AcceptInviteContainer";
import { LinearProgress } from "@mui/material";
import { SignInUp } from "../components/SignInUp";
import { useAuthedUserRD, useCompanyUserRD } from "../network/firebase/hooks";
import { NewCompany } from "../components/NewCompany";
import { useEffect, useState } from "react";
import { setGlobalContext, useUserId } from "../state/context";
import { CollectionTypes } from "@chewing-bytes/firebase-standards";
import { appGetDoc } from "../network/firebase/api-client";

/**
 * Basically there's 5 cases that aren't loading states
 *  - 1. Logged out
 *  - 2. Logged in - no company
 *  - 3. Logged in - invited
 *  - 4. Logged in - a member
 *  - 5. Logged in - selected company, not a member and no invite
 */
//

export const IfCompany = ({ children }: { children?: React.ReactNode }) => {
  const [myInviteRD, setMyInviteRD] = useState<
    RemoteData<CollectionTypes["invites"] | undefined, undefined>
  >(RD.initialized);
  const [acceptedInvite, setAcceptedInvite] = useState(false);
  const userId = useUserId();
  useEffect(() => {
    if (userId) {
      setMyInviteRD(RD.pending);
      appGetDoc("invites", userId)
        .then((v) => {
          if (v.type !== "success") return setMyInviteRD(RD.failure(undefined));
          else setMyInviteRD(RD.success(v.data));
          setGlobalContext({ companyId: v.data.companyId });
        })
        .catch(() => {
          setGlobalContext({ companyId: undefined });
          setMyInviteRD(RD.failure(undefined));
        });
    }
  }, [userId, setMyInviteRD]);
  const signedInRD = RD.map(useAuthedUserRD(), () => true);
  const loading = <LinearProgress />;
  return (
    <>
      {RD.fold(signedInRD, {
        // Case 1 - initialized or failure
        _: () => <SignInUp />,
        pending: () => loading,
        success: () => {
          // Logged In
          return RD.fold(myInviteRD, {
            failure: () => <NewCompany />,
            success: (invite) =>
              // Case 2
              invite && invite.status === "invited" && !acceptedInvite ? (
                // Case 3
                <HeaderSidebar noSidebar>
                  <AcceptInviteContainer
                    onAccept={() => {
                      setAcceptedInvite(true);
                    }}
                  />
                </HeaderSidebar>
              ) : (
                // Cases 4 and 5
                <CompanyAccess>{children}</CompanyAccess>
              ),
            _: () => loading,
          });
        },
      })}
    </>
  );
};

/**
 *
 */
const CompanyAccess = ({ children }: { children: React.ReactNode }) => {
  const companyUserRD = useCompanyUserRD();
  return RD.fold(companyUserRD, {
    // Case 4
    success: () => <>{children}</>,
    // Case 5
    failure: () => <NewCompany />,
    _: () => <LinearProgress />,
  });
};
