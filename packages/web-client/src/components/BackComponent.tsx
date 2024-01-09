import { ArrowBack } from "@mui/icons-material";
import { IconButton, IconButtonProps } from "@mui/material";
import { useNavigate } from "react-router";

export const BackComponent = (props: IconButtonProps) => {
  const nav = useNavigate();
  return (
    <IconButton
      onClick={() => {
        nav("/dashboard");
      }}
      {...props}
    >
      <ArrowBack />
    </IconButton>
  );
};
