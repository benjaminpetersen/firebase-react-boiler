import { Download } from "@mui/icons-material";
import React from "react";
import { AsyncButton } from "./AsyncButton";
import { PropsOf } from "../utils/propsOf";

export const DownloadFiles = ({
  children,
  ...props
}: React.PropsWithChildren<PropsOf<typeof AsyncButton>>) => {
  return (
    <AsyncButton startIcon={<Download />} {...props}>
      {children || "Download"}
    </AsyncButton>
  );
};
