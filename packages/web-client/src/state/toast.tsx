import { useEffect, useRef } from "react";
import { AppSnackbar } from "../components/AppSnackbar";
import { PropsOf } from "../utils/propsOf";
import { uniqueId } from "lodash-es";
import { createGlobalState } from "react-hooks-global-state";
export type Toast = PropsOf<typeof AppSnackbar> & { rendered?: boolean };

const { getGlobalState, setGlobalState, useGlobalState } = createGlobalState<{
  toasts: Toast[];
}>({ toasts: [] });

export const setToast = (t: Toast[]) => {
  const toasts = getGlobalState("toasts");
  setGlobalState("toasts", [...toasts, ...t]);
};

type WeakKey = object;

const idMap = new WeakMap<WeakKey, ReturnType<typeof uniqueId>>();

export const getKeyByRef = (t: WeakKey) => {
  if (!idMap.get(t)) idMap.set(t, uniqueId());
  return idMap.get(t);
};

export const useGlobalToasts = () => {
  const [toasts, setToasts] = useGlobalState("toasts");
  const prevToasts = useRef(toasts);
  const cleanupTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    return () => {
      for (const id of cleanupTimers.current) {
        clearTimeout(id);
      }
    };
  }, []);
  useEffect(() => {
    const newToasts = toasts.filter((t) => !prevToasts.current.includes(t));
    prevToasts.current = toasts;
    for (const newToast of newToasts) {
      const autohide = newToast.autoHideDuration;
      cleanupTimers.current.push(
        setTimeout(() => {
          setToasts((toasts) => toasts.filter((t) => t !== newToast));
        }, autohide || 5000),
      );
    }
  }, [toasts]);
  return toasts.map((t) => <AppSnackbar {...t} key={getKeyByRef(t)} />);
};
