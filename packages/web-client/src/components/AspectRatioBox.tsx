import { PropsWithChildren } from "react";

// Copied and modified from https://codesandbox.io/s/aspect-ratio-box-material-ui-1106l?file=/AspectRatioBox.js:0-580

const AspectRatioBox = ({
  children,
  ratio = 1,
}: PropsWithChildren<{ ratio?: number }>) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        className="full-width-children"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {children}
      </div>
      <div style={{ paddingBottom: (1 / ratio) * 100 + "%" }} />
    </div>
  );
};

export default AspectRatioBox;
