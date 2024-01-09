import { RD, RemoteData } from "@chewing-bytes/remote-data";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { createContext } from "react";
import { setGlobalContext } from "../state/context";
import { auth } from "../network/firebase/init";
import { AppErr } from "../domains/errors";

type AuthUser = Pick<User, "displayName" | "email" | "uid" | "photoURL">;

export const useAuthedUserOnce = () => {
  // Local signed-in state.
  const [authUserRD, setAuthUserRD] = React.useState<
    RemoteData<AuthUser, AppErr>
  >(RD.initialized);

  // Listen to the Firebase Auth state and set the local state.
  React.useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(auth, (user) => {
      setAuthUserRD(user ? RD.success(user) : RD.initialized);
      setGlobalContext({
        userId: user?.uid || undefined,
        authEmail: user?.email || undefined,
      });
    });
    return () => {
      // Make sure we un-register Firebase observers when the component unmounts.
      unregisterAuthObserver();
    };
  }, []);
  return authUserRD;
};

export const AuthContext = createContext<RemoteData<AuthUser, AppErr>>(
  RD.initialized,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authRD = useAuthedUserOnce();
  return <AuthContext.Provider value={authRD}>{children}</AuthContext.Provider>;
};
