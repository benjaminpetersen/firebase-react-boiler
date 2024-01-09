import { useEffect } from "react";
import { FieldValues, Path, useForm } from "react-hook-form";

export const useAppForm = <T extends FieldValues>(
  opts: { focus?: Path<T> },
  ...args: Parameters<typeof useForm<T>>
) => {
  const state = useForm<T>(...args);
  useEffect(() => {
    if (opts.focus) state.setFocus(opts.focus);
  }, [opts.focus, state.setFocus]);
  return state;
};
