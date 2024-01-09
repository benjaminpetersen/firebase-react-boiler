import { Modal } from "@mui/material";
import { useState } from "react";

export const FullScreenOption = ({
  children,
}: {
  children: (props: {
    setFullscreen: (f: boolean) => void;
    fullscreen: boolean;
  }) => React.ReactElement;
}) => {
  const [fs, setFs] = useState(false);
  const node = children({ setFullscreen: setFs, fullscreen: fs });
  return (
    <>
      <Modal open={fs}>{node}</Modal>
      {node}
    </>
  );
};
