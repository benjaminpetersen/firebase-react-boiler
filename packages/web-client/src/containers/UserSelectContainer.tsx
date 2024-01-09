import { Button, TableCell, Toolbar } from "@mui/material";
import { AppAvatar } from "../components/AppAvatar";
import { SimpleAvatarList } from "../components/SimpleAvatarList";
import { useUsersRD } from "../network/firebase/hooks";
import { RemoteDataRender } from "./RemoteDataRender";
import { useState } from "react";
import { ScrollContainer } from "../components/ScrollContainer";
import { PropsOf } from "../utils/propsOf";

export const UserSelectContainer = ({
  selectedUserIds,
  onSubmit,
  ...props
}: {
  selectedUserIds: string[];
  onSubmit: (u: { selectedUserIds: string[] }) => void;
} & Partial<PropsOf<typeof SimpleAvatarList>>) => {
  const [ids, setIds] = useState(selectedUserIds);
  return (
    <RemoteDataRender
      remoteData={useUsersRD()}
      success={({ currentUsers }) => (
        <ScrollContainer
          bottom={
            <Button
              fullWidth
              className="fim"
              onClick={() => {
                onSubmit({ selectedUserIds: ids });
              }}
            >
              Submit
            </Button>
          }
        >
          <Toolbar />
          <SimpleAvatarList
            title="Select Users To Grant Access"
            tableRows={currentUsers
              .sort((u) => (selectedUserIds.includes(u.id) ? -1 : 1))
              .map((u) => {
                const isSelected = ids.includes(u.id);
                return {
                  avatar: (
                    <AppAvatar alt={u.data.name} src={u.data.avatarUrl} />
                  ),
                  main: u.data.name,
                  additionalCells: (
                    <TableCell>
                      {u.data.admin ? (
                        "Admin"
                      ) : (
                        <Button
                          color={isSelected ? "warning" : "success"}
                          onClick={() => {
                            setIds((ids) =>
                              isSelected
                                ? ids.filter((id) => id !== u.id)
                                : [...ids, u.id],
                            );
                          }}
                        >
                          {isSelected ? "Revoke Access" : "Grant Access"}
                        </Button>
                      )}
                    </TableCell>
                  ),
                };
              })}
            {...props}
          />
        </ScrollContainer>
      )}
    />
  );
};
