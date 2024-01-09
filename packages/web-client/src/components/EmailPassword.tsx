import { EmailTextField, PasswordTextField } from "./AppTextField";
import { useForm } from "react-hook-form";
import { AsyncButton } from "./AsyncButton";
import React from "react";

export type IEmailPassword = {
  email: string;
  password: string;
};

export const EmailPassword = ({
  form,
  midContent,
  ...rest
}: (
  | { submitContent: string; onSubmit: () => Promise<void> }
  | { submitContent: Exclude<React.ReactNode, string> }
) & {
  form: ReturnType<typeof useForm<{ email: string; password: string }>>;
  midContent?: React.ReactNode;
}) => {
  return (
    <form style={{ padding: "24px" }}>
      <EmailTextField form={form} sx={{ mb: 3 }} />
      <PasswordTextField form={form} sx={{ mb: 3 }} />
      {midContent}
      {typeof rest.submitContent === "string" && "onSubmit" in rest ? (
        <AsyncButton fullWidth type="submit" onClick={rest.onSubmit}>
          {rest.submitContent}
        </AsyncButton>
      ) : (
        rest.submitContent
      )}
    </form>
  );
};
