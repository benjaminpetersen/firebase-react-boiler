import { useForm } from "react-hook-form";
import { validateEmail } from "../utils/validators";
import { FirebaseError } from "firebase/app";
import { logError } from "../network/firebase/db";
import { auth } from "../network/firebase/init";
import * as fbAuth from "firebase/auth";
import { EmailPassword, IEmailPassword } from "../components/EmailPassword";
import { AsyncButton } from "../components/AsyncButton";
export const SignInContainer = () => {
  const fm = useForm<IEmailPassword>();
  return (
    <EmailPassword
      onSubmit={fm.handleSubmit(async () => {
        const values = fm.getValues();
        try {
          await fbAuth.signInWithEmailAndPassword(
            auth,
            values.email,
            values.password,
          );
          return;
        } catch (e) {
          if (e instanceof FirebaseError) {
            if (e.code === "auth/wrong-password")
              return fm.setError("password", { message: "Wrong password" });
            if (e.code === "auth/user-not-found")
              return fm.setError("email", {
                message: "No user with this email found, signup instead",
              });
          }
          logError(e);
          fm.setError("email", {
            message: "Failed to sign in",
            type: "",
          });
        }
      })}
      submitContent="Sign In"
      form={fm}
      midContent={
        <AsyncButton
          sx={{ alignSelf: "right" }}
          onClick={async () => {
            const { email } = fm.getValues();
            if (validateEmail(email) === undefined) {
              try {
                await fbAuth.sendPasswordResetEmail(auth, email);
              } catch (e) {
                logError(e);
              }
            }
          }}
        >
          Send reset link
        </AsyncButton>
      }
    />
  );
};
