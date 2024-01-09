import { TableCell, Checkbox, Tooltip } from "@mui/material";
import {
  AvatarTableRowProps,
  SimpleAvatarList,
  SimpleAvatarListProps,
} from "./SimpleAvatarList";
import { PropsOf } from "../utils/propsOf";
export const UserList = ({
  tableRows,
  topRight,
  ...props
}: {
  tableRows: (AvatarTableRowProps & {
    onSetAdmin: (a: boolean) => void;
    admin: boolean;
    isMe: boolean;
  })[];
  topRight: SimpleAvatarListProps["topRight"];
} & Partial<PropsOf<typeof SimpleAvatarList>>) => {
  return (
    <SimpleAvatarList
      title="Users"
      topRight={topRight}
      tableHeader={{
        mainHeader: "Name",
        deleteHeader: "Remove User",
        additionalCellHeaders: <TableCell>Admin</TableCell>,
      }}
      tableRows={tableRows.map((f) => ({
        additionalCells: (
          <TableCell>
            <Tooltip
              title={
                f.isMe
                  ? "You cannot remove your own admin access"
                  : f.admin
                    ? "Revoke admin privilege"
                    : "Grant admin privilege"
              }
            >
              <Checkbox
                checked={f.admin}
                onChange={() => {
                  f.onSetAdmin(!f.admin);
                }}
                disabled={f.isMe}
              />
            </Tooltip>
          </TableCell>
        ),
        ...f,
        onDelete: f.isMe ? undefined : f.onDelete,
      }))}
      {...props}
    />
  );
};
