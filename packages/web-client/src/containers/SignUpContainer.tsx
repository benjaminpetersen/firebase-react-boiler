import { EmailPassword, IEmailPassword } from "../components/EmailPassword";
import { useForm } from "react-hook-form";
import { auth } from "../network/firebase/init";
import { signInWithCustomToken } from "firebase/auth";
import { FBFunctionButton } from "../components/FBFunctionButton";

export const SignUpContainer = () => {
  const fm = useForm<IEmailPassword>();
  return (
    <EmailPassword
      form={fm}
      submitContent={
        <FBFunctionButton
          type="submit"
          endpoint="signUp"
          submit={(e, call) => {
            const handle = fm.handleSubmit(async (values) => {
              const res = await call(values);
              if (res?.exists)
                fm.setError("email", { message: "This email is already used" });
              if (res?.token) await signInWithCustomToken(auth, res.token);
            });
            handle(e);
          }}
        >
          Sign Up
        </FBFunctionButton>
      }
    />
  );
};
