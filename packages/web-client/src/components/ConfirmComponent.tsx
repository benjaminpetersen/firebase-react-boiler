import { Close } from "@mui/icons-material";
import { Box, Button, IconButton, Popover, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { AsyncButton } from "./AsyncButton";

export const ConfirmComponent = ({
  msg = "Are you sure?",
  onConfirm,
  button,
}: {
  msg?: string;
  onConfirm: () => void | Promise<void>;
  button?: React.ReactNode;
}) => {
  const anchRef = useRef<HTMLElement>(null);
  const anch = anchRef.current;
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } finally {
      setOpen(false);
    }
  };
  return (
    <>
      <Popover anchorEl={anch} open={open} onClose={handleClose}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">{msg}</Typography>
          <AsyncButton color="success" onClick={handleConfirm}>
            Yes
          </AsyncButton>
          <Button color="info" onClick={handleClose}>
            No
          </Button>
        </Box>
      </Popover>
      <span
        ref={anchRef}
        onClick={() => {
          setOpen(true);
        }}
      >
        {button}
      </span>
    </>
  );
};

export const DeleteConfirm = ({
  onDelete,
}: {
  onDelete: () => void | Promise<void>;
}) => {
  return (
    <ConfirmComponent
      onConfirm={onDelete}
      button={
        <IconButton edge="end" aria-label="delete">
          <Close color="error" />
        </IconButton>
      }
    />
  );
};
