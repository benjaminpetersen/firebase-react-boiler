import { auth } from "./init";

export const signOut = () => {
  localStorage.clear();
  auth.signOut();
};
