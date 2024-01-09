import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import GoogleButton from "react-google-button";
import { auth } from "../network/firebase/init";
import { CSSProperties } from "react";

const googleProvider = new GoogleAuthProvider();

export const GoogleSigninContainer = ({ style }: { style?: CSSProperties }) => {
  return (
    <GoogleButton
      style={style}
      onClick={() => {
        signInWithPopup(auth, googleProvider).catch(() => {
          //
        });
      }}
    />
  );
};
