import { Box, IconButton, TableCell } from "@mui/material";
import { FallbackGhostTypography } from "./FallbackGhostTypography";
import { SimpleAvatarList } from "./SimpleAvatarList";
import { Edit, Visibility } from "@mui/icons-material";
import { StatusDropdown } from "./StatusDropdown";
import { AppAvatar } from "./AppAvatar";
import { ModalTriggerContainer } from "../containers/ModalTriggerContainer";
import { UserSelectContainer } from "../containers/UserSelectContainer";
import { PropsOf } from "../utils/propsOf";

export type ContractUser = {
  name?: string;
  avatarUrl?: string;
};

type ContractListItem = {
  name?: string;
  onDelete: () => void;
  setStatus: (status: "completed" | "current") => Promise<void> | void;
  edit: () => void;
  open: () => void;
  updateAssignees: (ids: string[]) => void;
  status: "completed" | "current";
  users: (ContractUser & { id: string })[];
  currentEditor?: ContractUser;
  createdBy: ContractUser;
};
export const ContractList = ({
  contracts,
  title,
  onCreate,
  ...props
}: {
  contracts: ContractListItem[];
  title: string;
  onCreate?: () => void;
} & Partial<PropsOf<typeof SimpleAvatarList>>) => (
  <SimpleAvatarList
    onCreate={onCreate}
    title={title}
    tableHeader={{
      avatarHeader: "Creator",
      deleteHeader: "",
      mainHeader: "Name",
      additionalCellHeaders: (
        <>
          <TableCell>Current Editor</TableCell>
          <TableCell>Assignees</TableCell>
          <TableCell>Status</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </>
      ),
    }}
    tableRows={contracts.map(
      ({
        createdBy,
        onDelete,
        setStatus,
        edit,
        open,
        updateAssignees,
        status,
        users,
        currentEditor,
        name,
      }) => ({
        avatar: <AppAvatar alt={createdBy.name} src={createdBy.avatarUrl} />,
        main: (
          <FallbackGhostTypography fallbackText="No Name">
            {name}
          </FallbackGhostTypography>
        ),
        onDelete,
        additionalCells: (
          <>
            <TableCell>
              {currentEditor && (
                <AppAvatar
                  alt={currentEditor.name}
                  src={currentEditor.avatarUrl}
                />
              )}
            </TableCell>
            <TableCell>
              <ModalTriggerContainer
                Trigger={({ onClick }) => (
                  <Box
                    sx={{ flexFlow: "row no-wrap", display: "flex" }}
                    onClick={onClick}
                  >
                    {users.map((u, i) => (
                      <AppAvatar alt={u.name} src={u.avatarUrl} key={i} />
                    ))}
                  </Box>
                )}
                Modal={({ closeModal }) => (
                  <UserSelectContainer
                    selectedUserIds={users.map((u) => u.id)}
                    onSubmit={(v) => {
                      updateAssignees(v.selectedUserIds);
                      closeModal();
                    }}
                  />
                )}
              />
            </TableCell>
            <TableCell>
              <StatusDropdown setStatus={setStatus} status={status} />
            </TableCell>
            <TableCell>
              <IconButton
                onClick={() => {
                  edit();
                }}
              >
                <Edit />
              </IconButton>
            </TableCell>
            <TableCell>
              <IconButton
                onClick={() => {
                  open();
                }}
              >
                <Visibility />
              </IconButton>
            </TableCell>
          </>
        ),
      }),
    )}
    {...props}
  />
);
