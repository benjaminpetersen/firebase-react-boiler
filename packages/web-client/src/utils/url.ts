import { compact } from "lodash-es";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const recordHas = <
  T extends Record<string, string>,
  K extends (keyof T & string)[],
>(
  keys: Readonly<K>,
  t: T,
): t is T & { [Key in K[number]]: string } => {
  return keys.every((k) => k in t && typeof t[k] === "string");
};

export const useParamsOnce = <RequiredParams extends string[]>(
  params: Readonly<RequiredParams>,
  onParams: (vals: { [K in RequiredParams[number]]: string }) => void,
) => {
  const loc = useLocation();
  const root = loc.pathname;
  const urlparams = loc.search.replace("?", "");
  const nav = useNavigate();
  useEffect(() => {
    const paramsArr =
      urlparams?.split("&").map((param) => {
        const [k, val] = param.split("=");
        return [k, val] as const;
      }) || [];
    const paramsObj = Object.fromEntries(paramsArr);
    if (recordHas(params, paramsObj)) {
      nav(
        compact([
          root,
          paramsArr
            .filter(([k]) => k && !params.includes(k))
            .map((kv) => compact(kv).join("="))
            .join("&"),
        ]).join("?"),
      );
      onParams(paramsObj);
    }
  }, [urlparams, nav, root]);
};
