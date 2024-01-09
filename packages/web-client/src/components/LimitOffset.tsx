import { Box, IconButton, Typography } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLimitOffset } from "../network/firebase/hooks";

export const LimitOffset = (props: ReturnType<typeof useLimitOffset>) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <IconButton
        onClick={() => {
          props.setPage(props.page - 1);
        }}
        disabled={props.page === 1}
      >
        <KeyboardArrowLeft />
      </IconButton>
      {props.totalPageNumber && props.totalPageNumber > 1 ? (
        <Typography variant="body1">
          page {props.page} / {props.totalPageNumber}
        </Typography>
      ) : null}
      <IconButton
        disabled={props.totalPageNumber === props.page}
        onClick={() => {
          props.setPage(props.page + 1);
        }}
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
};
