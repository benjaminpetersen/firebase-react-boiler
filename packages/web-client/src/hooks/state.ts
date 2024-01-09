import { useCallback, useMemo, useState } from "react";

type SetT<T, OmitKeys extends string | never> = (
  t: Omit<Partial<T>, OmitKeys> | "reset",
) => void;

export const useUpdatingState = <
  T extends object,
  OmitKeys extends string | never = never,
>(
  value: T,
): [T, SetT<T, OmitKeys>] => {
  const [updates, _setUpdates] = useState<Partial<Omit<T, OmitKeys>>>({});
  const setUpdates = useCallback<SetT<T, OmitKeys>>(
    (t) => {
      _setUpdates(t === "reset" ? {} : { ...updates, ...t });
    },
    [_setUpdates, updates],
  );
  const updatedValue = useMemo(() => {
    return { ...value, ...updates };
  }, [updates, value]);
  return [updatedValue, setUpdates];
};
