import { AddCircleOutlined } from "@mui/icons-material";
import { IconButton, IconButtonProps } from "@mui/material";

export const PlusIcon = (props: IconButtonProps) => {
  return (
    <IconButton color="primary" {...props}>
      <AddCircleOutlined color="inherit" />
    </IconButton>
  );
};
