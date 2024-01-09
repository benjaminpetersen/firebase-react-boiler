import React from "react";
import { IconButton, Popover } from "@mui/material";
export const DropdownIconButton = ({
  dropdownContent,
  children,
}: React.PropsWithChildren<{ dropdownContent: React.ReactNode }>) => {
  const id = "dropdown";
  const [open, setOpen] = React.useState(false);
  const anchor = React.useRef(null);
  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={() => {
          setOpen((o) => !o);
        }}
        ref={anchor}
      >
        {children}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchor.current}
        onClose={() => {
          setOpen(false);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {dropdownContent}
      </Popover>
    </>
  );
};
