import * as z from "zod";

export type BackendFunctions =
  | "none"
  | "devGrants"
  | "devOnlySeed"
  | "sendInviteToCompany"
  | "createCompany"
  | "signUp"
  | "deleteUser";

const fnMap = <K extends { [K in BackendFunctions]: unknown }>(k: K) => k;

export const functionRequestData = fnMap({
  none: z.undefined(),
  createCompany: z.object({ name: z.string().optional() }),
  deleteUser: z.object({ userId: z.string().min(1) }),
  devGrants: z.any(),
  devOnlySeed: z.any(),
  sendInviteToCompany: z.object({
    email: z.string().min(1),
    admin: z.boolean().default(false),
  }),
  signUp: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export type FunctionRequestData = {
  [K in keyof typeof functionRequestData]: z.infer<
    (typeof functionRequestData)[K]
  >;
};

export type FunctionInput = {
  [K in keyof typeof functionRequestData]: (typeof functionRequestData)[K]["_input"];
};

export const functionResponseData = fnMap({
  none: z.undefined(),
  createCompany: z.object({ companyId: z.string() }),
  deleteUser: z.object({}),
  devGrants: z.any(),
  devOnlySeed: z.any(),
  sendInviteToCompany: z.object({}),
  signUp: z.object({
    token: z.string().min(1).optional(),
    exists: z.boolean().default(false),
  }),
  updateContract: z.object({}),
});

export type FunctionResponseData = {
  [K in keyof typeof functionResponseData]: z.infer<
    (typeof functionResponseData)[K]
  >;
};
export type FunctionResponseInput = {
  [K in keyof typeof functionResponseData]: (typeof functionResponseData)[K]["_input"];
};

export type FetchResponse<T = undefined> = {
  needAdmin?: string;
  needPermissionFromAdmin?: string;
  needToBeCompanyUser?: string;
  needToBeUser?: string;
  data?: T;
  feedback?: { msg: string; severity: "info" | "success" | "error" }[];
};
