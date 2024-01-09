import { AddCircleOutlineOutlined } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router";

type Props = {
  text: string;
} & ({ navTo: string } | { onClick: () => void });

export const BigPlusButton = ({ text, ...other }: Props) => {
  const nav = useNavigate();
  return (
    <Button
      onClick={() => {
        "navTo" in other ? nav(other.navTo) : other.onClick();
      }}
      sx={{ height: "200px", width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <Box>
          <AddCircleOutlineOutlined />
        </Box>
        <Box>{text}</Box>
      </Box>
    </Button>
  );
};
