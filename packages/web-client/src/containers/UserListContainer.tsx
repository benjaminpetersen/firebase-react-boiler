import { UserList } from "../components/UserList";
import { useUsersRD } from "../network/firebase/hooks";
import { RemoteDataRender } from "./RemoteDataRender";
import { deleteUser, setUserAdmin } from "../network/firebase/db";
import { AppAvatar } from "../components/AppAvatar";
import { ModalTriggerContainer } from "./ModalTriggerContainer";
import { PlusIcon } from "../components/PlusIcon";
import { InviteUsersContainer } from "./InviteUsersContainer";
import { useUserId } from "../state/context";

const InviteUsersModal = () => {
  return <InviteUsersContainer />;
};

export const UserListContainer = () => {
  const usersRd = useUsersRD();
  const userId = useUserId();
  return (
    <RemoteDataRender
      remoteData={usersRd}
      success={(users) => (
        <UserList
          topRight={
            <ModalTriggerContainer
              Modal={InviteUsersModal}
              Trigger={(props) => {
                return <PlusIcon {...props} />;
              }}
            />
          }
          tableRows={users.currentUsers.map(({ data: u, id }) => ({
            isMe: id === userId,
            avatar: <AppAvatar alt={u.name} src={u.avatarUrl} />,
            main: u.name || u.email,
            admin: u.admin,
            onDelete: () => {
              deleteUser(id);
            },
            onSetAdmin: (admin: boolean) => {
              setUserAdmin({ id, admin });
            },
          }))}
        />
      )}
    />
  );
};
