import { createGlobalState } from "react-hooks-global-state";
import { devLogger } from "../utils/logger";
import { getLs, setLs } from "../utils/localStorage";
export type IUserContext = {
  userId?: string;
  companyId?: string;
  authEmail?: string;
  devAdminUIOverwride?: boolean;
};

const { getGlobalState, setGlobalState, useGlobalState } = createGlobalState<{
  state: IUserContext;
}>({
  state: {
    userId: undefined,
    companyId: getLs("company-id"),
    authEmail: undefined,
  },
});

export const useCtx = () => useGlobalState("state")[0];

export const changeCompanies = (id?: string) => {
  setGlobalContext({ companyId: id || undefined });
};

export const setGlobalContext = (ctx: Partial<IUserContext>) => {
  const { companyId } = ctx;
  if (companyId && typeof companyId === "string")
    setLs("company-id", companyId);
  devLogger("Global context change", ctx);
  setGlobalState("state", (vals) => ({ ...vals, ...ctx }));
};

// export const useCtx = () => useContext(UserContext);
export const useCompanyId = () => useCtx().companyId;
export const useUserId = () => useCtx().userId;
export const getCtx = <K extends keyof IUserContext>(k: K): IUserContext[K] =>
  getGlobalState("state")[k];
export const getCompanyId = () => getCtx("companyId");
export const getUserId = () => getCtx("userId");
