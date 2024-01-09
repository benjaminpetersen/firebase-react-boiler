import {
  Box,
  Grid,
  IconButton,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import FileIcon from "@mui/icons-material/FileCopy";
import AlertIcon from "@mui/icons-material/WarningAmberOutlined";
import { Close } from "@mui/icons-material";
export const FileListItem = ({
  name,
  progress,
  error,
  onDelete,
}: {
  name: string;
  progress?: number;
  error?: string;
  onDelete?: () => void;
}) => {
  return (
    <ListItem
      secondaryAction={
        onDelete ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Close />
          </IconButton>
        ) : undefined
      }
    >
      <Grid container spacing={3} alignItems={"center"}>
        <Grid item xs="auto">
          <Box width="50px" height="50px">
            {typeof error === "string" ? (
              <Tooltip title={error}>
                <AlertIcon
                  sx={{ height: "100%", width: "100%" }}
                  color="error"
                />
              </Tooltip>
            ) : (
              <FileIcon sx={{ height: "100%", width: "100%" }} />
            )}
          </Box>
        </Grid>
        <Grid item>
          {/* Name */}
          <Typography variant="h6">{name}</Typography>
        </Grid>
      </Grid>
    </ListItem>
  );
};
