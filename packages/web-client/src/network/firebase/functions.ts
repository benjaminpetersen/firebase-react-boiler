import { setGlobalContext } from "../../state/context";
import { auth } from "./init";

export const signOut = () => {
  localStorage.clear();
  auth.signOut();
  setGlobalContext({
    authEmail: undefined,
    companyId: undefined,
    devAdminUIOverwride: undefined,
    userId: undefined,
  });
};
