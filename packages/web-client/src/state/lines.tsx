import { useRef } from "react";
import { createStore } from "react-hooks-global-state";
import { produce } from "immer";

export type LineStateP1s = Record<string, HTMLElement>;
export type LineStateP2s = Record<string, HTMLElement[]>;

type Action<N extends string, T> = {
  type: N;
  value: T;
};

type State = {
  p1s: LineStateP1s;
  p2s: LineStateP2s;
  // The element that the lines will render within
  viewport?: HTMLElement;
  // Elements that should appear on top of the lines.
  occlusions: HTMLElement[];
};

const initialState: State = {
  p1s: {},
  p2s: {},
  occlusions: [],
  viewport: undefined,
};

type NameEl = { name: string; el: HTMLElement };
const addOnce = <T,>(t: T, arr: T[]) => {
  const newArr = arr.filter((v) => v !== t);
  return [...newArr, t];
};
const reducer = (
  state: State,
  action:
    | Action<"mount-p1", NameEl>
    | Action<"mount-p2", NameEl>
    | Action<"unmount-p1", NameEl>
    | Action<"unmount-p2", NameEl>
    | Action<"mount-viewport", HTMLElement>
    | { type: "unmount-viewport" }
    | Action<"mount-occlusion", HTMLElement>
    | Action<"unmount-occlusion", HTMLElement>,
) => {
  return produce(state, (draft: State) => {
    switch (action.type) {
      case "mount-p1":
        draft.p1s[action.value.name] = action.value.el;
        break;
      case "mount-p2":
        draft.p2s[action.value.name] = addOnce(
          action.value.el,
          draft.p2s[action.value.name] || [],
        );
        break;
      case "unmount-p1":
        if (action.value.name in draft.p1s) delete draft.p1s[action.value.name];
        break;
      case "unmount-p2": {
        draft.p2s[action.value.name] = (
          draft.p2s[action.value.name] || []
        ).filter((v) => v !== action.value.el);
        break;
      }
      case "mount-viewport":
        draft.viewport = action.value;
        break;
      case "unmount-viewport":
        draft.viewport = undefined;
        break;
      case "mount-occlusion":
        draft.occlusions = addOnce(action.value, draft.occlusions);
        break;
      case "unmount-occlusion":
        draft.occlusions = draft.occlusions.filter((el) => el !== action.value);
        break;
      default:
    }
  });
};

const { dispatch, useStoreState } = createStore(reducer, initialState);

const refHookBuilder = (type: "mount-p1" | "mount-p2") => (name: string) => {
  const ref = useRef<HTMLElement | null>(null);
  return (el: HTMLElement | null) => {
    const prev = ref.current;
    if (el) {
      ref.current = el;
      dispatch({ type, value: { name, el } });
    }
    if (el === null && prev) {
      dispatch({
        type: type === "mount-p1" ? "unmount-p1" : "unmount-p2",
        value: { name, el: prev },
      });
    }
  };
};

export const useLinesViewportRef = () => {
  return (el: HTMLElement | null) => {
    dispatch(
      el ? { type: "mount-viewport", value: el } : { type: "unmount-viewport" },
    );
  };
};
export const useLinesOcclusion = () => {
  const ref = useRef<HTMLElement | null>(null);
  return (el: HTMLElement | null) => {
    const prev = ref.current;
    ref.current = el;
    if (el) {
      dispatch({ type: "mount-occlusion", value: el });
    } else if (el === null && prev)
      dispatch({ type: "unmount-occlusion", value: prev });
  };
};

export const useP1Ref = refHookBuilder("mount-p1");
export const useP2Ref = refHookBuilder("mount-p2");
export const useLineRefs = useStoreState;
