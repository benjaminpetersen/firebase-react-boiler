import { TextField, TextFieldProps } from "@mui/material";
import { PropsOf } from "../utils/propsOf";
import { FieldValues, Path, RegisterOptions } from "react-hook-form";
import { validateEmail } from "../utils/validators";
type Errors = Record<
  string,
  { message?: string; type?: string | number } | undefined
>;

const getErr = (errs: Errors, name: string) => {
  const error = errs[name];
  const errorMsg = error?.message
    ? error?.message
    : error?.type === "required"
      ? "Required"
      : undefined;
  return { errorMsg, error: Boolean(error) };
};

// This should mirror the return of useForm
// Any additional needed useForm features can freely be added
type FormStateSlice<T extends FieldValues, K extends Path<T>> = {
  register: (
    name: K,
    valArgs?: RegisterOptions<T, K>,
  ) => Partial<TextFieldProps>;
  formState: { errors: Errors };
};

export const FormTextField = <T extends FieldValues, Name extends Path<T>>({
  form,
  name,
  validation,
  ...props
}: TextFieldProps & {
  form: FormStateSlice<T, Name>;
  name: Name;
  validation?: RegisterOptions<T, Name>;
}) => {
  const { error, errorMsg } = getErr(form.formState.errors, name);
  return (
    <TextField
      fullWidth
      name={name}
      {...props}
      {...form.register(name, validation)}
      error={error}
      helperText={errorMsg}
    />
  );
};

type FormTextFieldProps<T extends FieldValues, Name extends Path<T>> = PropsOf<
  typeof FormTextField<T, Name>
>;

export const EmailTextField = (
  props: Omit<
    FormTextFieldProps<{ email: string }, "email">,
    "name" | "validation"
  >,
) => {
  return (
    <FormTextField
      name="email"
      label="Email"
      validation={{ required: true, validate: validateEmail }}
      {...props}
    />
  );
};
export const PasswordTextField = (
  props: Omit<
    FormTextFieldProps<{ password: string }, "password">,
    "name" | "validation"
  >,
) => {
  return (
    <FormTextField
      name="password"
      validation={{
        required: true,
        minLength: { message: "Must be at least 8 characters", value: 8 },
      }}
      label="Password"
      type="password"
      {...props}
    />
  );
};
