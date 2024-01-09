export type UserContext = { companyId: string; userId: string };
export type MaybeId = { id?: string };
export type FileName = { fileName: string };
export type ContextAndId = UserContext & MaybeId;
export type CompanyId = { companyId: string };

export const join = (...args: (string | undefined)[]) => {
  const strs = args.filter((v): v is string => typeof v === "string");
  if (strs.find((s) => s.length === 0)) {
    throw new Error("Missing path part");
  }
  return strs.join("/");
};
