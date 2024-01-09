export type LsKey = "company-id" | "filling-name" | "contract-id";
export const lsKey = (key: LsKey) => `doc-proc-${key}`;
export const getLs = (key: LsKey): string | undefined =>
  localStorage.getItem(lsKey(key)) || undefined;
export const setLs = (key: LsKey, val?: string) =>
  val
    ? localStorage.setItem(lsKey(key), val)
    : localStorage.removeItem(lsKey(key));
