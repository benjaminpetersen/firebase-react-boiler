import { Box, Drawer } from "@mui/material";
import React, { useState } from "react";

export const ModalTriggerContainer = ({
  Trigger,
  Modal,
}: {
  Modal: React.FC<{ closeModal: () => void }>;
  Trigger: React.FC<{ onClick: () => void }>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
  };
  const open = () => {
    setIsOpen(true);
  };
  return (
    <React.Fragment key={"right"}>
      <Trigger onClick={open} />
      <Drawer anchor={"right"} open={isOpen} onClose={close}>
        <Box className="full-size" sx={{ p: 3 }}>
          <Modal closeModal={close} />
        </Box>
      </Drawer>
    </React.Fragment>
  );
};
