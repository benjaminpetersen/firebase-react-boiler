import { Avatar, Tooltip } from "@mui/material";
import { PropsOf } from "../utils/propsOf";

export const AppAvatar = (props: PropsOf<typeof Avatar>) => {
  return (
    <Tooltip title={props.alt}>
      <Avatar {...props} />
    </Tooltip>
  );
};
