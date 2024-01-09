import { AppAvatar } from "./AppAvatar";

export const SignedInUserAvatar = ({
  avatarUrl,
  name,
}: {
  avatarUrl?: string;
  name: string;
}) => {
  return <AppAvatar alt={name} src={avatarUrl} />;
};
