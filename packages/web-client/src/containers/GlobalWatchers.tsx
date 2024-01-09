import React from "react";
import { setGlobalContext, useCtx } from "../state/context";
import { useGlobalToasts } from "../state/toast";
import { useParamsOnce } from "../utils/url";

export const GlobalWatchers = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  useParamsOnce(["companyId"] as const, ({ companyId }) => {
    setGlobalContext({ companyId });
  });
  const toasts = useGlobalToasts();
  const ctx = useCtx();
  return (
    <React.Fragment key={`${ctx.companyId}-${ctx.userId}`}>
      {toasts}
      {children}
    </React.Fragment>
  );
};
