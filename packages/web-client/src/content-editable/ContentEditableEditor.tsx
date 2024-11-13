import { useEffect, useRef } from "react";
import { onPasteRawText } from "./past-raw-text-handler";

// The storage format will be xml
export const ContentEditableEditor = () => {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    addEventListener("paste", onPasteRawText);
    return () => {
      removeEventListener("paste", onPasteRawText);
    };
  }, []);
  return <div ref={ref} contentEditable></div>;
};
