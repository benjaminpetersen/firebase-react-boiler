import { MenuItem, Select, Typography } from "@mui/material";
import { useState } from "react";
export type CompleteCurrent = "current" | "completed";
export const StatusDropdown = ({
  status,
  setStatus,
}: {
  status: CompleteCurrent;
  setStatus: (s: CompleteCurrent) => Promise<void> | void;
}) => {
  const [loadingVal, setLoadingVal] = useState<"current" | "completed">();
  return (
    <Select
      value={loadingVal || status}
      onChange={async (e) => {
        if (e.target.value === "completed" || e.target.value === "current") {
          setLoadingVal(e.target.value);
          await setStatus(e.target.value);
          setLoadingVal(undefined);
        }
      }}
      variant="standard"
    >
      <MenuItem value="completed">
        <Typography variant="button" color="success">
          Completed
        </Typography>
      </MenuItem>
      <MenuItem value="current">
        <Typography variant="button" color="info">
          Current
        </Typography>
      </MenuItem>
    </Select>
  );
};
