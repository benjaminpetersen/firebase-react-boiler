import { SignInUp } from "../components/SignInUp";
import { useIsAuthedRD } from "../network/firebase/hooks";
import { RD } from "@chewing-bytes/remote-data";
import { HeaderSidebar } from "../layout/HeaderSidebar";
import { Skeleton } from "@mui/material";
import React from "react";

export const IfAuthed = ({ children }: { children: React.ReactNode }) => {
  const isAuthedRD = useIsAuthedRD();
  return (
    <>
      {RD.fold(isAuthedRD, {
        success: (isAuthed) => (isAuthed ? <>{children}</> : <SignInUp />),
        _: () => <SignInUp />,
        pending: () => (
          <HeaderSidebar>
            <Skeleton sx={{ width: "100%", height: "100%" }} />
          </HeaderSidebar>
        ),
      })}
    </>
  );
};
