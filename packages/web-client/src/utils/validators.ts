import * as zod from "zod";
const email = zod.string().email();
export const validateEmail = (s?: unknown) =>
  email.safeParse(s).success ? undefined : "Must be an email";
