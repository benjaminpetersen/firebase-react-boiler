import React from "react";

export const useTimeout = (
  cb: () => void,
  timeout: number,
  interval = false,
) => {
  const start = React.useRef(Date.now());
  const ran = React.useRef<boolean>(false);
  const timeSinceStart = Date.now() - start.current;

  React.useEffect(() => {
    const timeoutRef = setTimeout(() => {
      if (!ran.current || interval) {
        cb();
        ran.current = true;
        if (interval) start.current = Date.now();
      }
    }, timeout - timeSinceStart);
    return () => {
      clearTimeout(timeoutRef);
    };
  }, [cb, timeout, interval, timeSinceStart]);
};
